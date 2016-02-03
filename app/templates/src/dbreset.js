import {util} from "bardo"

async function reset () {
  // Drop and then create the database
  await util.dropDatabase()
  await util.createDatabase()
}

export default reset
