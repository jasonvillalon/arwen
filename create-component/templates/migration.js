exports.up = function(pgm) {
  pgm.createTable("<%= snakeCasedComponentName %>", {
    "id": {
      type: "uuid",
      primaryKey: true,
      "default": pgm.func("uuid_generate_v1mc()"),
    },
    <% fields.forEach(function(property) { %>
    "<%= property.name %>": {
      "type": "<%= property.type %>",<% if (property.reference) { %>
      "references": '"<%= property.reference %>" ON UPDATE CASCADE ON DELETE CASCADE',<% } %><% if (property.defaults) { %>
      "default": <%= property.defaults %>,<% } %><% if (property.notNull) { %>
      "notNull": true<% } %>
    },<% }) %>
    // Created and updated timestamps
    "created_at": {
      "type": "timestamptz",
      "default": pgm.func("now()"),
      "notNull": true,
    },
    "created_by": {
      "type": "uuid",
      "references": '"user" ON UPDATE CASCADE ON DELETE RESTRICT',
      "notNull": false
    },
    "updated_at": {
      "type": "timestamptz",
      "default": pgm.func("now()"),
      "notNull": true
    },
    "last_updated_by": {
      "type": "uuid",
      "references": '"user" ON UPDATE CASCADE ON DELETE RESTRICT',
      "notNull": false
    },
    "deleted_at": {
      "type": "timestamptz",
      "default": pgm.func("now()"),
      "notNull": false
    },
    "deleted_by": {
      "type": "uuid",
      "references": '"user" ON UPDATE CASCADE ON DELETE RESTRICT',
      "notNull": false
    }
  });
  pgm.sql(`
    CREATE TRIGGER update_<%= snakeCasedComponentName %>_timestamp
    BEFORE UPDATE ON "<%= snakeCasedComponentName %>"
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();`);
};

exports.down = function(pgm) {
  pgm.sql("DROP TRIGGER update_<%= snakeCasedComponentName %>_timestamp on <%= snakeCasedComponentName %>");
  pgm.dropTable("<%= snakeCasedComponentName %>");
};
