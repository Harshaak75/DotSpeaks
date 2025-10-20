import supabase from "../../config/supabase";
import prisma from "../../lib/prismaClient";

const convertBigIntsToString = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const newObj: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "bigint") {
        newObj[key] = value.toString(); // Convert BigInt to string
      } else if (typeof value === "object" && value !== null) {
        newObj[key] = convertBigIntsToString(value); // Recurse for nested objects/arrays
      } else {
        newObj[key] = value; // Keep primitives as is
      }
    }
  }
  return newObj;
};

/**
 * Determines the CMO's future planning target quarter name based on the lag since the
 * QuarterlyProjection data was inserted by the CEO.
 * @param addedQuarterName - The quarter name (e.g., 'Q1') of the data just inserted.
 * @param createdAtISO - The ISO date string of when the data was created/updated.
 * @returns {string} The quarter name the CMO should focus on (e.g., 'Q2', 'Q3').
 */
const determineCMOTargetQuarter = (
  addedQuarterName: string,
  createdAtISO: string
): string => {
  // Quarters array for cycling
  const qOrder = ["Q1", "Q2", "Q3", "Q4"];
  const addedQIndex = qOrder.indexOf(addedQuarterName); // e.g., Q1 is index 0

  const creationDate = new Date(createdAtISO);
  const now = new Date();

  // Determine month difference (handling year rollover)
  const creationMonth = creationDate.getMonth(); // 0-11
  const currentMonth = now.getMonth(); // 0-11

  let monthDifference = currentMonth - creationMonth;
  if (monthDifference < 0) {
    monthDifference += 12;
  }

  // Base offset is Qn+1 (1 quarter ahead)
  let quarterOffset = 1;

  // Adjust offset based on how many months of the "current" quarter have passed
  // since the target was set (giving the CMO enough runway).
  if (monthDifference === 1) {
    quarterOffset = 2;
  } else if (monthDifference >= 2 && monthDifference < 3) {
    quarterOffset = 3;
  } else if (monthDifference >= 3) {
    quarterOffset = 1;
  }

  // Calculate the final quarter index (using modulo to handle Q4 -> Q1 wrap-around)
  const finalQIndex = (addedQIndex + quarterOffset) % 4;
  return qOrder[finalQIndex];
};

export const NewContentAddedInQuterlyProjection = async () => {
  const channel = supabase.channel("projections");

  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "QuarterlyProjection",
    },
    async (payload: any) => {
      const newProjection = payload.new;
      const yearlyTargetId = newProjection.yearlyTargetId;
      const quarterBeingInserted = newProjection.quarterName;

      console.log(
        `🚀 Backend detected change on QuarterlyProjection (Event: ${payload.eventType}): ${quarterBeingInserted}`
      );

      // --- Anchor Logic: Only run the full lookup and broadcast when Q1 is inserted ---
      if (quarterBeingInserted !== "Q1") {
        // If it's Q2, Q3, or Q4 being inserted, we trust the logic ran when Q1 arrived.
        return;
      }

      // --- Step 1: Fetch all 4 projections for the new yearly target ID ---
      let allProjections: any[] = [];
      try {
        // Fetch all 4 quarters related to the target ID that was just inserted
        allProjections = await prisma.quarterlyProjection.findMany({
          where: {
            yearlyTargetId: yearlyTargetId,
          },
          orderBy: {
            quarterName: "asc", // Ensures Q1, Q2, Q3, Q4 order if needed
          },
        });

        if (allProjections.length < 4) {
          console.warn(
            `⏳ Target fetch incomplete (found ${allProjections.length}/4 quarters). Waiting for more inserts...`
          );
          // We must wait for all 4 to be visible in the DB before proceeding with logic
          return;
        }
      } catch (error) {
        console.error(
          "❌ Prisma fetch failed during target processing:",
          error
        );
        return;
      }

      // --- Step 2: Determine the CMO's required target quarter (e.g., 'Q2') ---
      // We use the Q1 record's creation date as the anchor for timing all calculations.
      const q1Projection = allProjections.find((p) => p.quarterName === "Q1");

      if (!q1Projection) return; // Safety check

      // NOTE: q1Projection.createdAt is a Date object from Prisma, so we use toISOString()
      // to pass the date consistently to determineCMOTargetQuarter.
      const cmoTargetQuarterName = determineCMOTargetQuarter(
        q1Projection.quarterName, // Q1
        q1Projection.createdAt.toISOString() // Use the Q1 creation date
      );

      // --- Step 3: Find the actual data for the required CMO quarter ---
      const cmoTargetData = allProjections.find(
        (p) => p.quarterName === cmoTargetQuarterName
      );

      if (!cmoTargetData) {
        console.error(
          `❌ Data missing for CMO target quarter: ${cmoTargetQuarterName}`
        );
        return;
      }

      // --- Step 4: Broadcast the single, definitive target to the CMO ---
      // FIX: Convert BigInts to strings before sending payload over the channel
      const cmoPayload = convertBigIntsToString(cmoTargetData);

      console.log(
        `✅ Broadcasting 'target_for_cmo' (Single Target: ${cmoTargetQuarterName}) && ${cmoPayload}`
      );

      // const response = await prisma.quarterlyProjection.findFirst({
      //     where:{
      //         id: cmoPayload.id
      //     },
      //     include:{
      //         yearlyTarget:{
      //             select:{
      //                 c
      //             }
      //         }
      //     }
      // })

      const latestVersion = await prisma.broadcastLog.findMany({
        where: { type: "target_for_cmo" },
        orderBy: { version: "desc" },
        take: 1,
      });
      const nextVersion = latestVersion[0]?.version
        ? latestVersion[0].version + 1
        : 1;

      await prisma.broadcastLog.create({
        data: {
          type: "target_for_cmo",
          version: nextVersion,
          payload: cmoPayload,
        },
      });

      channel.send({
        type: "broadcast",
        event: "target_for_cmo",
        payload: {
          // This is the only data the client needs to update the dashboard
          quarter: cmoTargetQuarterName,
          data: cmoPayload,
          version: nextVersion,
        },
      });

      // --- Optional: Broadcast the current quarter to the Team (Q1) ---
      const teamTargetData = allProjections.find(
        (p) => p.quarterName === q1Projection.quarterName
      );
      if (teamTargetData) {
        // FIX: Convert BigInts to strings before sending payload
        const teamPayload = convertBigIntsToString(teamTargetData);

        console.log(`📢 Broadcasting 'target_for_team' (Current Target: Q1)`);
        channel.send({
          type: "broadcast",
          event: "target_for_team",
          payload: {
            quarter: q1Projection.quarterName,
            data: teamPayload,
          },
        });
      }
    }
  );

  channel.subscribe((status, err) => {
    if (status === "SUBSCRIBED") {
      console.log("✅ Backend successfully subscribed to projection changes!");
    }
    if (status === "CHANNEL_ERROR") {
      console.error("❌ Backend error subscribing to projection changes:", err);
    }
  });

  return channel;
};
