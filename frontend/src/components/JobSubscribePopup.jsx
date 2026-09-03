import SubscribePopupBase from "./SubscribePopupBase";
import { submitJobSubscribe, JOBS_POPUP_KEY } from "../hooks/useSubscribe";

export default function JobSubscribePopup({ delay }) {
  return (
    <SubscribePopupBase
      submit={submitJobSubscribe}
      storageKey={JOBS_POPUP_KEY}
      title="New jobs, straight to you"
      blurb="Get an email whenever a new opening is posted. No spam."
      doneText="✓ Subscribed — watch your inbox."
      delay={delay}
    />
  );
}
