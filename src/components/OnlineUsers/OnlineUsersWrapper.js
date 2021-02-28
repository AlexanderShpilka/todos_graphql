import React, { useEffect, useState } from 'react';
import { useMutation, gql, useSubscription } from '@apollo/client';

import OnlineUser from './OnlineUser';

const UPDATE_LAST_SEEN = gql`
  mutation updateLastSeen($now: timestamptz!) {
    update_users(where: {}, _set: { last_seen: $now }) {
      affected_rows
    }
  }
`;

const GET_ONLINE_USERS = gql`
  subscription getOnlineUsers {
    online_users(order_by: { user: { name: asc } }) {
      id
      user {
        name
      }
    }
  }
`;

const OnlineUsersWrapper = () => {
  const [onlineIndicator, setOnlineIndicator] = useState(0);
  const [updateLastSeenMutation] = useMutation(UPDATE_LAST_SEEN);
  const { loading, error, data } = useSubscription(GET_ONLINE_USERS);

  const updateLastSeen = () => {
    updateLastSeenMutation({
      variables: { now: new Date().toISOString() },
    });
  };

  useEffect(() => {
    updateLastSeen();
    setOnlineIndicator(setInterval(() => updateLastSeen(), 30000));

    return () => {
      clearInterval(onlineIndicator);
    };
  }, []);

  let onlineUsersList;
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.error(error);
    return <span>Error!</span>;
  }
  if (data) {
    onlineUsersList = data.online_users.map((u) => <OnlineUser key={u.id} user={u.user} />);
  }

  return (
    <div className="onlineUsersWrapper">
      <div className="sliderHeader">Online users - {onlineUsersList.length}</div>
      {onlineUsersList}
    </div>
  );
};

export default OnlineUsersWrapper;
