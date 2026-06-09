import React, { useEffect, useState } from "react";
import { currentUser } from "../app/api/endpoints/user";

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) return;

    setLoading(true);

    currentUser()
      .then((res) => {
        setUser(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  return { user, loading };
};

export default useUser;
