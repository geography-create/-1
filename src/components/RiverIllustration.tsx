interface Props {
  src: string;
  title: string;
}

// 같은 하천의 서로 다른 두 모습을 보여주는 실제 사진이에요.
export default function RiverIllustration({ src, title }: Props) {
  return (
    <figure className="river-illustration">
      <img src={src} alt={title} loading="lazy" />
      <figcaption>{title}</figcaption>
    </figure>
  );
}
