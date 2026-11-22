// Original illustration tile per category. It is also the fallback whenever a
// class has no photo, so the layout never depends on an image loading.
const ART = {
  Strength: { icon: '🏋️', tone: 'strength' },
  Cardio: { icon: '🏃', tone: 'cardio' },
  'Mind & Body': { icon: '🧘', tone: 'mind' },
  Dance: { icon: '💃', tone: 'dance' },
};

export default function ClassArt({ category, title, size = 'card' }) {
  const art = ART[category] ?? { icon: '✨', tone: 'default' };
  return (
    <div
      className={`class-art class-art--${art.tone} class-art--${size}`}
      role="img"
      aria-label={`${category} class illustration for ${title}`}
    >
      <span aria-hidden="true">{art.icon}</span>
    </div>
  );
}
