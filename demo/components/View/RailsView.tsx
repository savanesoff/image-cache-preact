import { Topic, fetchTopics } from '@demo/utils/assets.endpoint';
import { useState, useEffect } from 'react';
import { PostersRail } from '../PostersRail';
import { config } from '@demo/config';
import { cn } from '@demo/utils';

export const RailsView = () => {
  const [data, setData] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTopics({ count: config.topics });
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <div className={cn('p-4', 'bg-slate-600', 'w-full space-y-2')}>
      {data.length === 0 && <div>Loading...</div>}
      {data.map(topic => (
        <PostersRail key={topic.id} topic={topic} fromPage={0} />
      ))}
    </div>
  );
};
