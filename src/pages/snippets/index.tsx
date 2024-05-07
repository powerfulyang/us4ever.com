import { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import PageHeading from '@/common/components/elements/PageHeading';
import { getCollection } from '@/common/libs/mdx';
import { MdxFileContentProps } from '@/common/types/snippets';
import { BrandIcon } from '@/common/types/StackIcon';
import { siteMetadata } from '@/contents/siteMetadata';

interface ContentPageProps {
  contentList: MdxFileContentProps[];
}

const SnippetsContentPage: NextPage<ContentPageProps> = ({ contentList }) => {
  if (!contentList.length) {
    return null;
  }

  const title = 'Code Snippets';
  const description =
    'Here is a code snippet, you can directly copy and use it.';

  const canonicalUrl = `${siteMetadata.siteUrl}/snippets`;

  const activeClasses = `flex justify-between w-full font-sora items-center gap-2 rounded-lg group
    text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-neutral-300
     hover:dark:!text-neutral-300 hover:lg:rounded-lg lg:transition-all lg:duration-300
  `;
  return (
    <>
      <NextSeo
        title={`${title} - ${siteMetadata.author}`}
        description={description}
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          images: [
            {
              url: '',
            },
          ],
          siteName: siteMetadata.author,
        }}
      />
      <Container data-aos='fade-up'>
        <PageHeading title={title} description={description} />
        <div className='grid-cols-2 gap-6 lg:grid'>
          {contentList.map((item) => (
            <Link
              className={activeClasses}
              href={`/snippets/${item.slug}`}
              key={item.slug}
              title={item.frontMatter.description || item.frontMatter.title}
            >
              <div className='h-full w-full mb-4 p-3 lg:p-4 gap-4 flex cursor-pointer rounded-lg border border-transparent shadow-intense hover:shadow-nextjs dark:shadow-intense-dark dark:hover:shadow-nextjs-dark lg:mb-0'>
                <div className='flex items-center justify-center'>
                  <BrandIcon type={item.frontMatter.type} />
                </div>
                <div className='overflow-hidden space-y-2'>
                  <h3 className='overflow-hidden overflow-ellipsis whitespace-nowrap text-base font-bold leading-8 tracking-tight lg:text-lg'>
                    {' '}
                    {item.frontMatter.title}{' '}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm lg:text-base'>
                    {item.frontMatter.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
};

export default SnippetsContentPage;

export const getStaticProps: GetStaticProps = async () => {
  const contentList = getCollection('snippets');

  if (!contentList.length) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }

  return {
    props: {
      contentList: contentList,
    },
  };
};
