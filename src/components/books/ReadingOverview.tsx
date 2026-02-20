import { Card } from "@/components/ui/card";

interface ReadingOverviewProps {
  total: number;
  inProgress: number;
  finished: number;
  mostRecentTitle?: string;
}

export const ReadingOverview = ({
  total,
  inProgress,
  finished,
  mostRecentTitle,
}: ReadingOverviewProps) => {
  return (
    <Card variant="important">
      <Card.Header>Reading Overview</Card.Header>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.8rem",
        }}
      >
        <StatBlock label="Books total" value={total} />
        <StatBlock label="In progress" value={inProgress} />
        <StatBlock label="Finished" value={finished} />
      </div>

      {mostRecentTitle && (
        <div
          style={{
            marginTop: "0.6rem",
            fontSize: "0.8rem",
            color: "#6b6b6b",
          }}
        >
          Most recently read: <strong>{mostRecentTitle}</strong>
        </div>
      )}
    </Card>
  );
};

const StatBlock = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div style={{ flex: 1 }}>
    <strong
      style={{
        display: "block",
        fontSize: "1.25rem",
        lineHeight: 1.2,
      }}
    >
      {value}
    </strong>
    <span
      style={{
        fontSize: "0.8rem",
        color: "#6b6b6b",
      }}
    >
      {label}
    </span>
  </div>
);
