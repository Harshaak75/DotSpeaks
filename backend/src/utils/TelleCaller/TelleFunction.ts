import prisma from "../../lib/prismaClient";

export const AssignLead = async (leadId: string, userId: string) => {
  try {
    // change the status to forwarded

    await prisma.telecommunicatorLeads.update({
      where: {
        id: leadId,
      },
      data: {
        status: "Forwarded",
      },
    });

    // search for all Bussiness Developer

    // const BussinessDeveloperData = await prisma.users.findMany({
    //   where: {
    //     role: "BRAND_DEVELOPER",
    //   },
    // });

    // if (BussinessDeveloperData.length == 0) {
    //   throw new Error("No telecommunicators available to assign leads to.");
    // }

    // const lastLead = await prisma.bussinessDeveloper.findFirst({
    //   orderBy: { created_at: "desc" },
    // });

    // let nextAssigneeId: any;

    // if (lastLead && lastLead.assignedToId) {
    //   const lastAssigneeIndex = BussinessDeveloperData.findIndex(
    //     (t) => t.id === lastLead.assignedToId
    //   );
    //   const nextIndex = (lastAssigneeIndex + 1) % BussinessDeveloperData.length; // The '%' makes it circle back
    //   nextAssigneeId = BussinessDeveloperData[nextIndex].id;
    // } else {
    //   // If there are no previous leads, assign it to the first person
    //   nextAssigneeId = BussinessDeveloperData[0].id;
    // }

    const bd_id = await prisma.bd_tele_assignments.findFirst({
      where:{
        tele_user_id: userId
      },
      select:{
        bd_user_id: true
      }
    })

    if(!bd_id){
      throw new Error("No Business Developer assigned to this Telecommunicator.");
      
    }

    const newLead = await prisma.bussinessDeveloper.create({
      data: {
        leadId: leadId,
        assignedToId: bd_id.bd_user_id,
        forwardedByTelecommunicatorId: userId
      },
    });

    return newLead;
  } catch (error) {
    console.log(error);
    return error;
  }
};
