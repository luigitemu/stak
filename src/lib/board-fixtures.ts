/**
 * Seed data for the demo board. This is inert data, not logic: it inflates
 * coverage (importing it marks every line covered) and produces meaningless
 * mutants, so the quality gate excludes it from mutation testing and from the
 * module-size budget.
 */
import type { Board, Column, Draft, Priority, Task } from "@/lib/board-types";

export const TEAM = [
  { id: "MK", name: "Mara Kim", avatarUrl: "https://i.pravatar.cc/150?img=47" },
  { id: "JT", name: "Jon Tran", avatarUrl: "https://i.pravatar.cc/150?img=12" },
  {
    id: "RS",
    name: "Rosa Silva",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "DP",
    name: "Dev Patel",
    avatarUrl: "https://i.pravatar.cc/150?img=13",
  },
];

function col(id: string, name: string, tasks: Task[]): Column {
  return { id, name, tasks };
}

export const INITIAL_BOARDS: Board[] = [
  {
    id: "b1",
    name: "Product Launch",
    icon: "paperplane.fill",
    color: "orange",
    pinned: true,
    updatedLabel: "Updated 2h ago",
    columns: [
      col("c1", "To Do", [
        {
          id: "t1",
          title: "Finalize landing page hero section variants",
          notes:
            "Three-email welcome sequence. Keep it under 80 words each; tone matches the landing page.",
          due: "2026-08-14",
          priority: "Med",
          labels: ["Design"],
          assignee: "JT",
          checklist: [],
        },
        {
          id: "t2",
          title: "Setup email automation for waitlist",
          notes: "Board, list and search results. Collect screenshots first.",
          due: "2026-08-15",
          priority: "Low",
          labels: ["Copy"],
          assignee: "MK",
          checklist: [],
        },
        {
          id: "t3",
          title: "Draft Q4 social media strategy",
          notes:
            "Timebox to 2 days. Answer: local-first store vs. queue-and-replay.",
          due: "2026-08-16",
          priority: "High",
          labels: ["Marketing"],
          assignee: "DP",
          checklist: [],
        },
      ]),
      col("c2", "In Progress", [
        {
          id: "t4",
          title: "Implement payment gateway integration",
          notes:
            "Complete the Stripe integration for the checkout flow. This includes handling subscription webhooks and setting up the success/failure redirect routes. Need to ensure SCA compliance for EU customers.",
          due: "2026-08-12",
          priority: "High",
          labels: ["Dev"],
          assignee: "DP",
          checklist: [
            { id: "k1", text: "Initial API Keys setup", done: true },
            { id: "k2", text: "Webhook endpoint validation", done: true },
            { id: "k3", text: "Frontend checkout form styling", done: false },
            { id: "k4", text: "Success & Failure redirects", done: false },
          ],
        },
        {
          id: "t5",
          title: "Pricing page revision",
          notes: "Two tiers instead of three. Needs new comparison table.",
          due: "2026-08-13",
          priority: "Med",
          labels: ["Design", "Copy"],
          assignee: "RS",
          checklist: [],
        },
      ]),
      col("c3", "Review", [
        {
          id: "t6",
          title: "Mobile nav pattern",
          notes: "PR #214. Check the responsive nav against the spec.",
          due: "2026-08-09",
          priority: "Med",
          labels: ["Design"],
          assignee: "MK",
          checklist: [],
        },
      ]),
      col("c4", "Done", [
        {
          id: "t7",
          title: "Set up analytics events",
          notes: "",
          due: "2026-08-07",
          priority: "Low",
          labels: ["Dev"],
          assignee: "JT",
          checklist: [],
        },
        {
          id: "t8",
          title: "Q3 roadmap one-pager",
          notes: "",
          due: "2026-08-05",
          priority: "Med",
          labels: ["Copy"],
          assignee: "RS",
          checklist: [],
        },
      ]),
    ],
  },
  {
    id: "b2",
    name: "Design System",
    icon: "paintbrush.fill",
    color: "indigo",
    pinned: true,
    updatedLabel: "Updated 5h ago",
    columns: [
      col("c1", "To Do", [
        {
          id: "t9",
          title: "Audit spacing tokens",
          notes: "Reconcile 4pt vs 8pt grid across components.",
          due: "2026-08-20",
          priority: "Med",
          labels: ["Design"],
          assignee: "MK",
          checklist: [],
        },
      ]),
      col("c2", "In Progress", [
        {
          id: "t10",
          title: "Button component variants",
          notes: "Primary, secondary, destructive, ghost.",
          due: "2026-08-17",
          priority: "High",
          labels: ["Design"],
          assignee: "RS",
          checklist: [],
        },
      ]),
      col("c3", "Review", []),
      col("c4", "Done", [
        {
          id: "t11",
          title: "Color palette v2",
          notes: "",
          due: "2026-08-04",
          priority: "Low",
          labels: ["Design"],
          assignee: "MK",
          checklist: [],
        },
      ]),
    ],
  },
  {
    id: "b3",
    name: "Frontend Overhaul",
    icon: "chevron.left.forwardslash.chevron.right",
    color: "green",
    pinned: false,
    updatedLabel: "Updated 2h ago",
    columns: [
      col("c1", "To Do", [
        {
          id: "t12",
          title: "Migrate to new list virtualization",
          notes: "",
          due: "2026-08-19",
          priority: "Med",
          labels: ["Dev"],
          assignee: "DP",
          checklist: [],
        },
      ]),
      col("c2", "In Progress", []),
      col("c3", "Review", []),
      col(
        "c4",
        "Done",
        Array.from({ length: 6 }, (_, i) => ({
          id: `t13${i}`,
          title: `Refactor legacy component ${i + 1}`,
          notes: "",
          due: "2026-08-01",
          priority: "Low" as Priority,
          labels: ["Dev"],
          assignee: "JT",
          checklist: [],
        }))
      ),
    ],
  },
  {
    id: "b4",
    name: "Q3 Marketing",
    icon: "megaphone.fill",
    color: "pink",
    pinned: false,
    updatedLabel: "Updated 1d ago",
    columns: [
      col(
        "c1",
        "To Do",
        Array.from({ length: 10 }, (_, i) => ({
          id: `t14${i}`,
          title: `Campaign asset ${i + 1}`,
          notes: "",
          due: "2026-08-22",
          priority: "Med" as Priority,
          labels: ["Marketing"],
          assignee: "RS",
          checklist: [],
        }))
      ),
      col("c2", "In Progress", [
        {
          id: "t15",
          title: "Draft Q4 social media strategy",
          notes: "",
          due: "2026-08-26",
          priority: "High",
          labels: ["Marketing"],
          assignee: "DP",
          checklist: [],
        },
      ]),
      col("c3", "Review", []),
      col("c4", "Done", [
        {
          id: "t16",
          title: "Launch teaser video",
          notes: "",
          due: "2026-07-28",
          priority: "Low",
          labels: ["Marketing"],
          assignee: "MK",
          checklist: [],
        },
      ]),
    ],
  },
  {
    id: "b5",
    name: "Hiring Pipeline",
    icon: "person.2.fill",
    color: "sky",
    pinned: false,
    updatedLabel: "Updated 3d ago",
    columns: [
      col("c1", "To Do", []),
      col("c2", "In Progress", []),
      col("c3", "Review", []),
      col(
        "c4",
        "Done",
        Array.from({ length: 4 }, (_, i) => ({
          id: `t17${i}`,
          title: `Candidate review ${i + 1}`,
          notes: "",
          due: "2026-08-02",
          priority: "Med" as Priority,
          labels: ["Dev"],
          assignee: "JT",
          checklist: [],
        }))
      ),
    ],
  },
];

export function blankDraft(boardId: string, colId: string): Draft {
  return {
    id: null,
    title: "",
    notes: "",
    due: "",
    priority: "Med",
    labels: "",
    assignee: TEAM[0].id,
    board: boardId,
    col: colId,
  };
}
