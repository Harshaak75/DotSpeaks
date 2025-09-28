import supabase from "../../config/supabase";
import prisma from "../../lib/prismaClient";
import { SendEmailToClient } from "../../utils/Functionality/Functions1";
async function handleNewClient(payload: any) {
  try {
    console.log("🚀 Realtime Trigger: New client detected!", payload.new);

    const newClient = payload.new;

    console.log(newClient);

    // Validate the incoming data
    if (!newClient || !newClient.package) {
      console.error(
        "Invalid payload received. Missing client data or package information."
      );
      return;
    }

    const ClientCreated = await prisma.brandHeadPackageAssignments.findMany({
      // Start the query from the assignment model
      where: {
        // Access the related 'package' model directly in the 'where' clause
        Package: {
          // Filter by the 'name' of the related package
          name: newClient.package,
        },
      },
      // The 'include' clause works exactly the same way
      select: {
        profile_id: true,
      },
    });

    if (ClientCreated.length === 0) {
      console.error(
        `Assignment failed: No Brand Heads found for package "${newClient.package}".`
      );
      return null;
    }

    const brandHeadIds = ClientCreated.map((bh: any) => bh.profile_id);

    // 2. If there's only one person, assign it to them immediately.
    if (brandHeadIds.length === 1) {
      const winnerId = brandHeadIds[0];
      console.log(`Only one Brand Head in package. Assigning to: ${winnerId}`);

      await prisma.bussinessDeveloper.update({
        where: {
          leadId: newClient.sourceLeadId,
        },
        data: {
          status: "Completed",
        },
      });

      const brandHead = await prisma.profiles.findUnique({
        where: {
          id: winnerId,
        },
      });

      // --- ADD THIS CHECK ---
      if (brandHead) {
        await SendEmailToClient(newClient, brandHead);
      } else {
        console.error(
          `Could not send email. Profile not found for Brand Head ID: ${winnerId}`
        );
      }

      return prisma.clientAssignment.create({
        data: {
          clinetId: newClient.id,
          BH_profile_id: winnerId,
        },
      });
    }

    // 3. Get the current client count for each Brand Head in the pool.
    const clientCounts = await prisma.clientAssignment.groupBy({
      by: ["BH_profile_id"],
      where: {
        BH_profile_id: {
          in: brandHeadIds,
        },
      },
      _count: {
        _all: true,
      },
    });

    // 4. Map counts to each Brand Head, defaulting to 0 for those with no clients yet.
    let candidates = brandHeadIds.map((id) => {
      const countEntry = clientCounts.find((c) => c.BH_profile_id === id);
      return {
        profileId: id,
        count: countEntry?._count._all || 0,
      };
    });

    // 5. Find the minimum client count.
    const minCount = Math.min(...candidates.map((c) => c.count));

    // 6. Filter to find all Brand Heads who are tied for the minimum count.
    let tiedCandidates = candidates.filter((c) => c.count === minCount);

    // 7. If there's no tie, we have our winner.
    if (tiedCandidates.length === 1) {
      const winnerId = tiedCandidates[0].profileId;
      console.log(
        `Found least busy Brand Head: ${winnerId} with ${minCount} clients.`
      );

      await prisma.bussinessDeveloper.update({
        where: {
          leadId: newClient.sourceLeadId,
        },
        data: {
          status: "Completed",
        },
      });

      const brandHead = await prisma.profiles.findUnique({
        where: {
          id: winnerId,
        },
      });

      // --- ADD THIS CHECK ---
      if (brandHead) {
        await SendEmailToClient(newClient, brandHead);
      } else {
        console.error(
          `Could not send email. Profile not found for Brand Head ID: ${winnerId}`
        );
      }

      return prisma.clientAssignment.create({
        data: {
          clinetId: newClient.id,
          BH_profile_id: winnerId,
        },
      });
    }

    // 8. TIE-BREAKER: Find who among the tied candidates got a client least recently.
    console.log(
      `Tie-breaker needed for ${tiedCandidates.length} Brand Heads with ${minCount} clients.`
    );
    const tiedIds = tiedCandidates.map((c) => c.profileId);
    const lastAssignments = await prisma.clientAssignment.groupBy({
      by: ["BH_profile_id"],
      where: {
        BH_profile_id: {
          in: tiedIds,
        },
      },
      _max: {
        // Get the most recent assignment date
        created_at: true,
      },
    });

    // Sort the tied candidates by their last assignment date (oldest first).
    // A candidate with no previous assignments (lastAssignment is undefined) wins automatically.
    tiedCandidates.sort((a, b) => {
      const lastA = lastAssignments.find(
        (la) => la.BH_profile_id === a.profileId
      );
      const lastB = lastAssignments.find(
        (la) => la.BH_profile_id === b.profileId
      );

      const timeA = lastA?._max.created_at?.getTime() || 0; // 0 if never assigned
      const timeB = lastB?._max.created_at?.getTime() || 0; // 0 if never assigned

      return timeA - timeB; // Ascending sort, so oldest (or 0) comes first
    });

    const winnerId = tiedCandidates[0].profileId;
    console.log(
      `Tie broken. Assigning to least recently assigned Brand Head: ${winnerId}`
    );

    await prisma.bussinessDeveloper.update({
      where: {
        leadId: newClient.sourceLeadId,
      },
      data: {
        status: "Completed",
      },
    });

    const brandHead = await prisma.profiles.findUnique({
      where: {
        id: winnerId,
      },
    });

    // --- ADD THIS CHECK ---
    if (brandHead) {
      await SendEmailToClient(newClient, brandHead);
    } else {
      console.error(
        `Could not send email. Profile not found for Brand Head ID: ${winnerId}`
      );
    }

    // 9. Create the final assignment record.
    return prisma.clientAssignment.create({
      data: {
        clinetId: newClient.id,
        BH_profile_id: winnerId,
      },
    });
    // send the email
  } catch (error) {
    return error;
  }

  // --- 3. TRIGGER NOTIFICATIONS ---
}

export function ListenNewClient() {
  const channel = supabase
    .channel("new-client-inserts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "clients",
      },
      handleNewClient
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Successfully subscribed to new client channel!");
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("❌ Error subscribing to channel:", err);
      }
    });

  return channel;
}
