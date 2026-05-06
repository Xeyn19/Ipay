"use client";

import { useEffect, useRef } from "react";

type NewsPostViewTrackerProps = {
  postId: string;
};

export function NewsPostViewTracker({
  postId,
}: NewsPostViewTrackerProps) {
  const initialPostIdRef = useRef(postId);

  useEffect(() => {
    void fetch(`/api/news/${initialPostIdRef.current}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
