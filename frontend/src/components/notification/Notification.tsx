import { useEffect, useState } from "react";

type NotificationProps = {
  message: string;
  type: string;
  onClose: () => void;
}


function Notification({ message, type, onClose }: NotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setShow(true);
    });

    const hideTimer = setTimeout(() => {
      setShow(false);
    }, 1900);

    const closeTimer = setTimeout(() => {
      onClose()
    }, 2200);

    return () => {
      cancelAnimationFrame(animation);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    }
      
  }, [message, onClose]);

  return (
    <div className={`notification notification-${type} ${show ? "show" : ""}`}>
      <p>{message}</p>
    </div>
  );
}

export default Notification