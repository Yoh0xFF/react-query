import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { PostDetail } from './PostDetail';
import { Post } from './types';

const maxPostPage = 10;

async function fetchPosts(pageId: number): Promise<Array<Post>> {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageId}`
  );
  return (await response.json()) as Array<Post>;
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentPage >= maxPostPage) {
      return;
    }

    const nextPage = currentPage + 1;
    queryClient.prefetchQuery(['posts', nextPage], () => fetchPosts(nextPage), {
      staleTime: 5000,
    });
  }, [queryClient, currentPage]);

  const { data, isLoading, isError, error } = useQuery(
    ['posts', currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 5000,
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  if (isError) {
    return (
      <>
        <h3>Oops, something went wrong</h3>
        <p>{(error as any).toString()}</p>
      </>
    );
  }

  return (
    <>
      <ul>
        {data &&
          data.map((post) => (
            <li
              key={post.id}
              className='post-title'
              onClick={() => setSelectedPost(post)}
            >
              {post.title}
            </li>
          ))}
      </ul>
      <div className='pages'>
        <button
          disabled={currentPage <= 1}
          onClick={() => {
            setCurrentPage((currentPage) => currentPage - 1);
          }}
        >
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button
          disabled={currentPage >= maxPostPage}
          onClick={() => {
            setCurrentPage((currentPage) => currentPage + 1);
          }}
        >
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
