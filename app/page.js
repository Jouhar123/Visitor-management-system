
import Dashboard from "./dashboard/page"

import Authapi from "./utils/Authapi"


export default function Home() {
  return (
    <div >
      <Authapi>
      <Dashboard />
      </Authapi>
    </div>
  );
}