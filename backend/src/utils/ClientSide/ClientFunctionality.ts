import prisma from "../../lib/prismaClient";
import { getSignedUrl } from "../SupabaseFunction/supabaseFunction";
import pdf from "pdf-parse";

// export const processAndStoreMarketingContent = async (payload: any) => {
//   try {
//     const content = payload.new;
//     const fileUrl = content.documentUrl;
//     const clientId = content.clientId;


//     if (!fileUrl || !clientId) return;

    
//     const SignedUrl = await getSignedUrl(fileUrl);

//     const response = await fetch(SignedUrl);
//     const buffer = await response.arrayBuffer();

//     const pdfData = await pdf(Buffer.from(buffer));

//     const lines = pdfData.text.split("\n");

//     console.log("lines: ", lines)

//     const result: any[] = [];
//     let capture = false;
//     let tempItem: {
//       date?: string;
//       marketerGuide?: string[];
//       hashtags?: string[];
//     } = {};
//     let marketerText: string[] = [];

//     for (let line of lines) {
//       line = line.trim();
//       if (!line) continue;

//       // Check for day + date pattern (e.g., Friday - 1/8/2025)
//       if (/^[A-Za-z]+ - \d{1,2}\/\d{1,2}\/\d{4}$/.test(line)) {
//         // Save previous item
//         if (tempItem.date) {
//           tempItem.marketerGuide = marketerText;
//           result.push(tempItem);
//           tempItem = {};
//           marketerText = [];
//         }
//         tempItem.date = line;
//         capture = false; // start capturing after Marketer Guide
//         continue;
//       }

//       // Check for 'Marketer Guide'
//       if (line === "Marketer Guide") {
//         capture = true;
//         continue;
//       }

//       // Capture marketer guide text until hashtags appear
//       if (capture) {
//         if (line.startsWith("#")) {
//           // Extract hashtags
//           tempItem.hashtags = line.match(/#\w+/g) || [];
//           capture = false; // stop capturing marketer text
//         } else {
//           marketerText.push(line);
//         }
//       }
//     }

//     // Push last item
//     if (tempItem.date) {
//       tempItem.marketerGuide = marketerText;
//       result.push(tempItem);
//     }

//     // console.log("The final result: ", result);

//     // store the data into the table

//     // 3. Store parsed posts into DB
//     for (const post of result) {
//       const dateString = post.date.split(" - ")[1];
//       const [day, month, year] = dateString.trim().split("/").map(Number);
//       const date = new Date(year, month - 1, day);

//       await prisma.marketingContent.create({
//         data: {
//           clientId,
//           title: "Marketing Guide",
//           content: post.marketerGuide?.join(" ") || "",
//           date,
//           hashtags: post.hashtags || [],
//           sourcePdf: fileUrl,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error processing and storing marketing content: ", error);
//   }
// };


export const processAndStoreMarketingContent = async (payload: any) => {
  try {
    const content = payload.new;
    const fileUrl = content.documentUrl;
    const clientId = content.clientId;
    const contentId = content.id;

    if (!fileUrl || !clientId) return;

    const SignedUrl = await getSignedUrl(fileUrl);
    const response = await fetch(SignedUrl);
    const buffer = await response.arrayBuffer();
    const pdfData = await pdf(Buffer.from(buffer));
    const lines = pdfData.text.split("\n");

    const result: any[] = [];
    let captureMarketer = false;
    let captureDesigner = false;

    let tempItem: {
      date?: string;
      platform?: string;
      postType?: string;
      postTime?: string;
      marketerGuide?: string[];
      hashtags?: string[];
      designerGuide?: {
        objective?: string;
        visual?: string;
        headline?: string;
        message?: string;
        cta?: string;
        branding?: string;
      };
    } = {};

    let marketerText: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Detect date line
      if (/^[A-Za-z]+ - \d{1,2}\/\d{1,2}\/\d{4}$/.test(line)) {
        // save previous
        if (tempItem.date) {
          tempItem.marketerGuide = marketerText;
          result.push(tempItem);
          tempItem = {};
          marketerText = [];
        }
        tempItem.date = line;

        // --- NEW LOGIC BLOCK: Look at the next line for platform, post type, and time ---
        const nextLine = lines[i + 1]?.trim(); // Safely access the next line

        // Check if the next line contains the expected format
        if (nextLine && nextLine.includes("|") && nextLine.includes(" at ")) {
          const parts = nextLine.split(/\s*\|\s*/); // Split by "|"
          const platformPart = parts[0]; // e.g., "Instagram"
          const postDetailsPart = parts[1]; // e.g., "Static Post at 11:00 AM"

          tempItem.platform = platformPart.trim();

          if (postDetailsPart) {
            const timeParts = postDetailsPart.split(/\s+at\s+/); // Split by " at "
            tempItem.postType = timeParts[0].trim();
            tempItem.postTime = timeParts[1]?.trim();
          }

          // IMPORTANT: Skip the next line in the loop since we've already processed it
          i++;
        }
        // --- END OF NEW LOGIC BLOCK ---

        captureMarketer = false;
        captureDesigner = false;
        continue;
      }

      // Start of Marketer Guide
      if (line === "Marketer Guide") {
        captureMarketer = true;
        continue;
      }

      // Start of Designer Guide
      if (line === "Designer Guide") {
        captureMarketer = false;
        captureDesigner = true;
        tempItem.designerGuide = {};
        continue;
      }

      // Capture marketer guide
      if (captureMarketer) {
        if (line.startsWith("#")) {
          tempItem.hashtags = line.match(/#\w+/g) || [];
          captureMarketer = false;
        } else {
          marketerText.push(line);
        }
      }

      // Capture designer guide fields
      if (captureDesigner) {
        if (line.startsWith("Objective:")) {
          tempItem.designerGuide!.objective = line.replace("Objective:", "").trim();
        } else if (line.startsWith("Visual:")) {
          tempItem.designerGuide!.visual = line.replace("Visual:", "").trim();
        } else if (line.startsWith("Headline:")) {
          tempItem.designerGuide!.headline = line.replace("Headline:", "").trim();
        } else if (line.startsWith("Message:")) {
          tempItem.designerGuide!.message = line.replace("Message:", "").trim();
        } else if (line.startsWith("CTA:")) {
          tempItem.designerGuide!.cta = line.replace("CTA:", "").trim();
        } else if (line.startsWith("Branding:")) {
          tempItem.designerGuide!.branding = line.replace("Branding:", "").trim();
          captureDesigner = false; // end block
        }
      }
    }

    // Push last
    if (tempItem.date) {
      tempItem.marketerGuide = marketerText;
      result.push(tempItem);
    }

    console.log("The final result: ", result);

    // Store into DB
    for (const post of result) {
      const dateString = post.date.split(" - ")[1];
      const [day, month, year] = dateString.trim().split("/").map(Number);
      const date = new Date(year, month - 1, day);

      let hours = 0, minutes = 0;
      if (post.postTime) {
        const timeMatch = post.postTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          minutes = parseInt(timeMatch[2], 10);
          const period = timeMatch[3].toUpperCase();

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0; // Midnight case
        }
      }

      // MODIFIED: Create a combined Date object with date and time
      const combinedDate = new Date(year, month - 1, day, hours, minutes);

      await prisma.marketingContent.create({
        data: {
          clientId,
          campaignTitle: "Campaign Content",
          date: combinedDate,
          platform: post.platform || "Unknown",
          postType: post.postType || "Unknown",
          contentId: contentId,
          hashtags: post.hashtags || [],
          sourcePdf: fileUrl,
          title: "Marketer Guide",
          content: post.marketerGuide?.join(" ") || "",
          designerTitle: "Designer Guide",
          objective: post.designerGuide?.objective || null,
          visual: post.designerGuide?.visual || null,
          headline: post.designerGuide?.headline || null,
          message: post.designerGuide?.message || null,
          cta: post.designerGuide?.cta || null,
          branding: post.designerGuide?.branding || null,
        },
      });
    }
  } catch (error) {
    console.error("Error processing and storing marketing content: ", error);
  }
};

export const fetchDesignerTasks = async (payload: any) =>{
  
}

