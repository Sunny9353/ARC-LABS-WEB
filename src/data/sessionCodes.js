export const SESSION_CODE_GROUPS = [
  {
    label: "Programs",
    options: [
      "IOT",
      "EMBED",
      "IIOT",
      "ROBO",
      "IORT",
      "AIOT",
      "AIORT",
      "ADVIOT",
      "UAV",
      "AI",
      "CPT",
      "APP",
    ],
  },
  {
    label: "Internships",
    options: [
      "IOTIN",
      "EMBEDIN",
      "IIOTIN",
      "IORTIN",
      "AIOTIN",
      "AIORTIN",
      "ADVIOTIN",
    ],
  },
];

export const SESSION_CODE_OPTIONS = SESSION_CODE_GROUPS.flatMap((group) =>
  group.options.map((code) => ({ group: group.label, value: code, label: code }))
);

export function isInternshipSessionCode(value) {
  return SESSION_CODE_GROUPS
    .find((group) => group.label === "Internships")
    .options.includes(String(value || "").trim().toUpperCase());
}
