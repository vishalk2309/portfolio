import SubscribePopupBase from "./SubscribePopupBase";
import { submitResourcesSubscribe, RESOURCES_POPUP_KEY } from "../hooks/useSubscribe";

export default function ResourcesSubscribePopup({ delay }) {
  return (
    <SubscribePopupBase
      submit={submitResourcesSubscribe}
      storageKey={RESOURCES_POPUP_KEY}
      title="New resources, straight to you"
      blurb="Get an email whenever a new resource drops. No spam."
      doneText="✓ Subscribed — watch your inbox."
      delay={delay}
    />
  );
}
