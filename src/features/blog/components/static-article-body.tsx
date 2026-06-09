import { type ArticleBlock } from '../data/static-articles';

function HeadingBlock({ level, text }: { level: 2 | 3; text: string }) {
  if (level === 2) {
    return (
      <h2 className="text-brand-dark-navy mt-4 w-full text-2xl font-semibold sm:text-[28px]">
        {text}
      </h2>
    );
  }
  return <h3 className="text-foreground mt-2 w-full text-xl font-semibold sm:text-2xl">{text}</h3>;
}

export function StaticArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div
      dir="rtl"
      className="mx-auto flex w-full max-w-[850px] flex-col gap-5 px-4 text-start sm:px-0"
    >
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return <HeadingBlock key={i} level={block.level} text={block.text} />;
        }
        if (block.type === 'list') {
          return (
            <ul
              key={i}
              className="text-foreground/80 flex w-full list-disc flex-col gap-2 ps-6 text-lg leading-8"
            >
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-foreground/80 w-full text-lg leading-8">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
