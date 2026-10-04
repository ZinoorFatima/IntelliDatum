import { useEffect, useRef, useState } from "react";

const DEFAULT_PICTURE = "/default-profile.jpg";

// The picture endpoint needs the JWT, which an <img src> can't send, so fetch it
// with the token and show it through an object URL. Returns [src, resetToDefault].
export const useProfilePicture = (auth) => {
  const [picture, setPicture] = useState(DEFAULT_PICTURE);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    if (!auth?.token) return;
    let cancelled = false;

    fetch("/api/user/profile-picture", {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;
        setPicture(url);
      })
      .catch((err) => console.error("Failed to load profile picture:", err));

    return () => {
      cancelled = true;
    };
  }, [auth]);

  // Release the last object URL when the component goes away
  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  return [picture, () => setPicture(DEFAULT_PICTURE)];
};
