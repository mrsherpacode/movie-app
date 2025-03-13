// Here, i'm creating a reuseable component.

const starContainer = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};
const star = {
  display: "flex",
  gap: "5px",
};
const text = {
  lineHeight: "1",
  margin: "0",
};

export default function StarRating({ maxRating = 5 }) {
  return (
    <div style={starContainer}>
      <div style={star}>
        {Array.from({ length: maxRating }, (_, i) => (
          <span key={i}>S{1 + i}</span>
        ))}
      </div>
      <p style={text}>10</p>
    </div>
  );
}
