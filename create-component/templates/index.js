import <%= classifiedComponentName %> from "./<%= classifiedComponentName %>"
import Resource from "Resource/index"
export default class res<%= classifiedComponentName %> extends Resource {
  Model = <%= classifiedComponentName %>
  sortable = ["createdAt"]
  defaultSort = "created_at"
}
