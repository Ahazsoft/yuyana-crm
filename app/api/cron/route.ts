import { NextResponse } from 'next/server';
import { prismadb as prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    // 1. Authorize the cron request
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    console.log('Cron job started at', new Date().toISOString());

    try {
        const now = new Date();
        const sevenDaysLater = new Date(now);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);


        // Run all three checks
        const [overdueTasksCount, leadFollowUpCount, contractExpiryCount] =
            await Promise.all([
                notifyTaskDeadlines(now),
                notifyLeadFollowUps(now),
                notifyContractExpirations(now, sevenDaysLater),
            ]);

        return NextResponse.json({
            success: true,
            overdueTasks: overdueTasksCount,
            leadFollowUps: leadFollowUpCount,
            contractExpirations: contractExpiryCount,
        });
    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ---------- Overdue Tasks  ----------
async function notifyTaskDeadlines(now: Date): Promise<number> {
    // Overdue: any task with dueDateAt < now and not completed
    const overdueCondition = {
        dueDateAt: { lt: now },
        taskStatus: { not: 'COMPLETE' as const },
    };

    // Exactly 2 days from now (ignoring time, in UTC)
    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    const startOfTargetDay = new Date(
        twoDaysLater.getFullYear(),
        twoDaysLater.getMonth(),
        twoDaysLater.getDate()
    );
    const endOfTargetDay = new Date(startOfTargetDay);
    endOfTargetDay.setDate(endOfTargetDay.getDate() + 1);

    const dueInTwoDaysCondition = {
        dueDateAt: {
            gte: startOfTargetDay,
            lt: endOfTargetDay,
        },
        taskStatus: { not: 'COMPLETE' as const },
    };

    // Fetch all matching tasks (overdue or due in 2 days)
    const tasks = await prisma.tasks.findMany({
        where: {
            OR: [overdueCondition, dueInTwoDaysCondition],
        },
        select: { id: true, title: true, user: true, dueDateAt: true },
    });

    let count = 0;

    for (const task of tasks) {
        if (!task.user) continue;

        const isOverdue = task.dueDateAt && task.dueDateAt < now;
        const title = isOverdue
            ? `⏰ Overdue task`
            : `⏰ Task due in 2 days`;
        const description = isOverdue
            ? `Task "${task.title}" is past its due date.`
            : `Task "${task.title}" is due in exactly 2 days.`;

        await prisma.notifications.create({
            data: {
                title,
                description,
                link: `/projects/tasks/viewtask/${task.id}`,
                receiverId: task.user,
                category: "Projects",
                subCategory: "Tasks",
            },
        });
        count++;
    }

    return count;
}

// ---------- Lead Follow‑ups ----------
async function notifyLeadFollowUps(now: Date): Promise<number> {
    const startOfTodayUTC = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 1,
            0,
            0,
            0,
            0
        )
    );

    const endOfTodayUTC = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - 1,
            23,
            59,
            59,
            0
        )
    );
    const leads = await prisma.crm_Leads.findMany({
        where: {
            followup_date: {
                gte: startOfTodayUTC,
                lt: endOfTodayUTC,
            },
            isArchived: "active",
            status: {
                not: "LOST",
            },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            assigned_to: true,
            followup_date: true,
        },
    });


    let count = 0;

    for (const lead of leads) {
        if (!lead.assigned_to) continue;

        const fullName = [lead.firstName, lead.lastName]
            .filter(Boolean)
            .join(" ");

        await prisma.notifications.create({
            data: {
                title: "📞 Follow-up reminder",
                description: `It's time to follow up with lead ${fullName}.`,
                link: `/leads/${lead.id}`,
                receiverId: lead.assigned_to,
                category: "CRM",
                subCategory: "Lead",
            },
        });

        count++;
    }

    return count;
}

// ---------- Contract Expirations ----------
async function notifyContractExpirations(
    now: Date,
    deadline: Date
): Promise<number> {


    const contracts = await prisma.crm_Contracts.findMany({
        where: {
            endDate: {
                gte: now,
                lte: deadline,
            },
            status: 'SIGNED',
        },
        select: { id: true, title: true, assigned_to: true, endDate: true },
    });

    let count = 0;

    for (const contract of contracts) {
        if (!contract.assigned_to) continue;

        const daysLeft = Math.ceil(
            (contract.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        await prisma.notifications.create({
            data: {
                title: `📄 Contract expiring soon`,
                description: `"${contract.title}" expires in ${daysLeft} day(s).`,
                link: `/contracts/${contract.id}`,
                receiverId: contract.assigned_to,
                category: "CRM",
                subCategory: "Contract",
            },
        });
        count++;
    }

    return count;
}

// ---------- Future: Contacts Birthday ( 1 day before )  ----------
async function notifyContactBirthdays() {
    // This is a bit more complex due to the need to ignore the year and handle leap years.
    // We can fetch all contacts with a birthday in the next day (ignoring year) and then filter in JS.
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const contacts = await prisma.crm_Contacts.findMany({
        where: {
            birthday: { not: null },
        },
        select: { id: true, first_name: true, last_name: true, birthday: true, assigned_to: true },
    });
    let count = 0;
    for (const contact of contacts) {
        if (!contact.assigned_to || !contact.birthday) continue;
        const birthdayThisYear = new Date(
            now.getFullYear(),
            contact.birthday.getMonth(),
            contact.birthday.getDate()
        );
        const diffInDays = Math.ceil(
            (birthdayThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffInDays === 1) {
            const fullName = [contact.first_name, contact.last_name]
                .filter(Boolean)
                .join(" ");
            await prisma.notifications.create({
                data: {
                    title: `🎉 Contact's birthday is tomorrow`,
                    description: `Tomorrow is ${fullName}'s birthday. Consider sending them your wishes!`,
                    link: `/contacts/${contact.id}`,
                    receiverId: contact.assigned_to,
                    category: "CRM",
                    subCategory: "Contact",
                },
            });
            count++;
        }
    }
}