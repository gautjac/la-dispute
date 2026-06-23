import { useState } from "react";
import { Arena } from "./components/Arena";
import { Home } from "./components/Home";
import { Onboarding, hasOnboarded } from "./components/Onboarding";

type Route = { name: "home" } | { name: "arena"; duelId: number };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [onboard, setOnboard] = useState(!hasOnboarded());

  return (
    <div className="min-h-screen">
      {onboard && <Onboarding onDone={() => setOnboard(false)} />}

      {route.name === "home" ? (
        <Home onOpen={(duelId) => setRoute({ name: "arena", duelId })} />
      ) : (
        <Arena duelId={route.duelId} onHome={() => setRoute({ name: "home" })} />
      )}
    </div>
  );
}
