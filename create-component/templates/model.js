import AbstractModel from "AbstractModel/index"

class <%= classifiedComponentName %> extends AbstractModel {
  static table = "<%= slugifiedComponentName %>"
  static dbFields = <%= fieldNames %>
}

export default <%= classifiedComponentName %>
