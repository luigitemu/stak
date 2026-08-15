export type Priority = "Low" | "Med" | "High";

export type ChecklistItem = { id: string; text: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  notes: string;
  due: string;
  priority: Priority;
  labels: string[];
  assignee: string;
  checklist: ChecklistItem[];
};

export type Column = { id: string; name: string; tasks: Task[] };
export type FilteredColumn = Column & { done: boolean };

export type Draft = {
  id: string | null;
  title: string;
  notes: string;
  due: string;
  priority: Priority;
  labels: string;
  assignee: string;
  board: string;
  col: string;
};


export type BoardColor = "orange" | "green" | "indigo" | "pink" | "sky" | "yellow" | "red" | "teal" | "blue" | "gray" | "purple";

export type Board = {
  id: string;
  name: string;
  icon: string;
  color: BoardColor;
  pinned: boolean;
  updatedLabel: string;
  columns: Column[];
};

export const BOARD_COLORS: Record<BoardColor, { fg: string; bg: string }> = {
  orange: { fg: "#ff9500", bg: "rgba(255,149,0,0.1)" },
  green: { fg: "#34c759", bg: "rgba(52,199,89,0.1)" },
  indigo: { fg: "#5856d6", bg: "rgba(88,86,214,0.1)" },
  pink: { fg: "#ff2d55", bg: "rgba(255,45,85,0.1)" },
  sky: { fg: "#5ac8fa", bg: "rgba(90,200,250,0.1)" },
  yellow: { fg: "#ffd600", bg: "rgba(255,214,0,0.1)" },
  red: { fg: "#ff3b30", bg: "rgba(255,59,48,0.1)" },
  teal: { fg: "#50e3c2", bg: "rgba(80,227,194,0.1)" },
  blue: { fg: "#007aff", bg: "rgba(0,122,255,0.1)" },
  gray: { fg: "#8e8e93", bg: "rgba(142,142,147,0.1)" },
  purple: { fg: "#9c27b0", bg: "rgba(156,39,176,0.1)" },
};

export const BOARD_ICONS = [
  "folder.fill",
  "list.bullet",
  "bookmark.fill",
  "key.fill",
  "gift.fill",
  "birthday.cake.fill",
  "graduationcap.fill",
  "backpack.fill",
  "ruler.fill",
  "doc.fill",
  "book.fill",
  "tray.full.fill",
  "creditcard.fill",
  "banknote.fill",
  "dumbbell.fill",
  "figure.run",
  "fork.knife",
  "wineglass.fill",
  "pills.fill",
  "stethoscope",
  "chair.fill",
  "house.fill",
  "building.2.fill",
  "building.columns.fill",
  "tent.fill",
  "tv.fill",
  "music.note",
  "laptopcomputer",
  "gamecontroller.fill",
  "headphones",
  "leaf.fill",
  "syringe.fill",
  "person.fill",
  "person.2.fill",
  "person.3.fill",
  "star.fill",
  "flag.fill",
  "heart.fill",
  "bolt.fill",
  "paperplane.fill",
  "briefcase.fill",
  "cart.fill",
  // Additional icons
  "bicycle",
  "car.fill",
  "airplane",
  "pawprint.fill",
  "paintbrush.fill",
  "camera.fill",
  "globe",
  "calendar",
  "alarm.fill",
  "clock.fill",
  "moon.fill",
  "sun.max.fill",
  "cloud.fill",
  "sparkles",
  "chart.bar.fill",
  "bell.fill",
  "envelope.fill",
  "magnifyingglass",
  "wifi",
  "cube.box.fill",
  "wand.and.stars",
] as const;

const LABEL_COLOR_ORDER: BoardColor[] = [
  "orange",
  "indigo",
  "sky",
  "pink",
  "green",
  "yellow",
  "red",
  "teal",
  "blue",
  "gray",
  "purple",
];

export function labelColor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++)
    hash = (hash * 31 + label.charCodeAt(i)) | 0;
  const key = LABEL_COLOR_ORDER[Math.abs(hash) % LABEL_COLOR_ORDER.length];
  return BOARD_COLORS[key];
}

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const TODAY = "2026-08-12";
export const PRIORITIES: Priority[] = ["Low", "Med", "High"];

export function fmt(d: string) {
  if (!d) return "";
  const x = new Date(d + "T00:00:00");
  return `${MONTHS[x.getMonth()]} ${x.getDate()}`;
}
