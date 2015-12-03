import dependencies from "./dependencies"

let {Server} = dependencies

export function run() {
  console.log("Welcome to Atomic Project")
  Server.run()
}
