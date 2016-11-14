import AbstractModel from "AbstractModel/index"
import {
  <% validators.forEach(function(validator) { %>
  <%= validator %>,
  <% }) %>
} from "Validators/index"

<% links.forEach(function(link) { %>import <%= link.name %> from "<%= link.path %>"
<% }) %>

class <%= classifiedComponentName %> extends AbstractModel {
  static table = "<%= snakeCasedComponentName %>"
  static dbFields = <%= fieldNames %>
  <% if (schema) { %>static schema = {<% schema.forEach(function(property) { %>
     <%= property.name %>: [<%= property.validator %>],<% }) %>
  }<% } %>

  <% if (links.length) { %>static links = [
    <% links.forEach(function(link) { %>{
      alias: "<%= link.alias %>",
      fk: "<%= link.fk %>",
      obj: <%= link.name %>,
    }
    <% }) %>
  ]<% } %>
}

export default <%= classifiedComponentName %>
