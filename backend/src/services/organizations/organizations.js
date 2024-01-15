// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import swagger from 'feathers-swagger';
import {disallow, iff, isProvider, preventChanges, softDelete} from 'feathers-hooks-common';

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  organizationDataValidator,
  organizationPatchValidator,
  organizationQueryValidator,
  organizationResolver,
  organizationExternalResolver,
  organizationDataResolver,
  organizationPatchResolver,
  organizationQueryResolver,
  organizationSchema,
  organizationDataSchema,
  organizationPatchSchema,
  organizationQuerySchema, uniqueOrgValidator, organizationPublicFields,
} from './organizations.schema.js'
import { OrganizationService, getOptions } from './organizations.class.js'
import { organizationPath, organizationMethods } from './organizations.shared.js'
import {
  isUserMemberOfOrganization,
  isUserOwnerOrAdminOfOrganization,
  canUserCreateOrganization,
  assignOrganizationIdToUser, isUserOwnerOfOrganization
} from './helpers.js';
import { addUsersToOrganization } from './commands/addUsersToOrganization.js';
import { removeUsersFromOrganization } from './commands/removeUsersFromOrganization.js';
import { giveAdminAccessToUsersOfOrganization } from './commands/giveAdminAccessToUsersOfOrganization.js';
import { revokeAdminAccessFromUsersOfOrganization } from './commands/revokeAdminAccessFromUsersOfOrganization.js';
import { createDefaultEveryoneGroup } from '../groups/commands/createDefaultEveryoneGroup.js';
import {copyOrgBeforePatch, distributeOrganizationSummaries} from './organizations.distrib.js';
import { addGroupsToOrganization } from './commands/addGroupsToOrganization.js';
import {
  authenticateJwtWhenPrivate,
  handlePublicOnlyQuery, ThrowBadRequestIfNotForPublicInfo,
  resolvePrivateResults
} from "../../hooks/handle-public-info-query.js";
import {userPublicFields, userResolver} from "../users/users.schema.js";
import {BadRequest} from "@feathersjs/errors";
import {OrganizationTypeMap} from "./organizations.subdocs.schema.js";

export * from './organizations.class.js'
export * from './organizations.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const organization = (app) => {
  // Register our service on the Feathers application
  app.use(organizationPath, new OrganizationService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: organizationMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: swagger.createSwaggerServiceOptions({
      schemas: { organizationSchema, organizationDataSchema, organizationPatchSchema , organizationQuerySchema, },
      docs: {
        description: 'An organization service',
        idType: 'string',
        securities: ['all'],
        operations: {
          get: {
            "parameters": [
              {
                "description": "ObjectID or refName of Organization to return",
                "in": "path",
                "name": "_id",
                "schema": {
                  "type": "string"
                },
                "required": true,
              },
              {
                "description": "If provided and set to \"true\", then only return public data",
                "in": "query",
                "name": "publicInfo",
                "schema": {
                  "type": "string"
                },
                "required": false,
              },
            ],
          },
          find: {
            "description": "Retrieves a list organizations.<ul><li>If publicInfo = true, then multiple orgs may be located but the information is limited to public info.</li><li>If logged in as Ondsel admin or an internal query, then everything is returned.</li><li>Otherwise, the query is not allowed.</li></ul>",
            "parameters": [
              {
                "description": "Number of results to return",
                "in": "query",
                "name": "$limit",
                "schema": {
                  "type": "integer"
                },
                "required": false,
              },
              {
                "description": "Number of results to skip",
                "in": "query",
                "name": "$skip",
                "schema": {
                  "type": "integer"
                },
                "required": false,
              },
              {
                "description": "Query parameters",
                "in": "query",
                "name": "filter",
                "style": "form",
                "explode": true,
                "schema": {
                  "$ref": "#/components/schemas/UserQuery"
                },
                "required": false,
              },
              {
                "description": "If provided and set to \"true\", then only return public data",
                "in": "query",
                "name": "publicInfo",
                "schema": {
                  "type": "string"
                },
                "required": false,
              },
            ],
          },
          patch: {
            "description": "Updates organization identified by id using supplied data.<p>Additionally various 'virtual' fields can perform functions such as <code>shouldAddUsersToOrganization</code>. Visit <a href='https://docs.google.com/document/d/1vC2wW-Gq98ZkinM2OM3YKlMhFkSrmAZjQZPZ_yztZKA/edit?usp=sharing'>API document</a> for details."
          }
        }
      }
    })
  })

  app.service(organizationPath).publish((data, context) => {
    return app.channel(context.result.users.map(user => user._id.toString()))
  })

  // Initialize hooks
  app.service(organizationPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(organizationExternalResolver),
        handlePublicOnlyQuery(organizationPublicFields),
        resolvePrivateResults(organizationResolver)
      ],
      find: [authenticateJwtWhenPrivate()],
      get: [authenticateJwtWhenPrivate()],
      create: [],
      update: [authenticate('jwt')],
      patch: [authenticate('jwt')],
      remove: [authenticate('jwt')]
    },
    before: {
      all: [
        // softDelete({
        //   deletedQuery: async context => {
        //     // Allow only owner to delete organization
        //     if ( context.method === 'remove' && context.params.user ) {
        //       return { createdBy: context.params.user._id, deleted: { $ne: true } }
        //     }
        //     return { deleted: { $ne: true } };
        //   }
        // }),
        schemaHooks.validateQuery(organizationQueryValidator),
        schemaHooks.resolveQuery(organizationQueryResolver)
      ],
      find: [
        iff(isProvider('external'), ThrowBadRequestIfNotForPublicInfo)
      ],
      get: [
        // member check has been moved to "after"
        detectOrgRefNameInId
      ],
      create: [
        uniqueOrgValidator,
        iff(isProvider('external'), canUserCreateOrganization),
        schemaHooks.validateData(organizationDataValidator),
        schemaHooks.resolveData(organizationDataResolver)
      ],
      patch: [
	      copyOrgBeforePatch,
        iff(isProvider('external'), preventChanges(false, 'admins', 'users', 'owner', 'deleted')),
        iff(isProvider('external'), isUserOwnerOrAdminOfOrganization),
        iff(
          context => context.data.shouldAddUsersToOrganization,
          addUsersToOrganization
        ),
        iff(
          context => context.data.shouldRemoveUsersFromOrganization,
          removeUsersFromOrganization
        ),
        iff(
          context => context.data.shouldGiveAdminAccessToUsersOfOrganization,
          giveAdminAccessToUsersOfOrganization,
        ),
        iff(
          context => context.data.shouldRevokeAdminAccessFromUsersOfOrganization,
          revokeAdminAccessFromUsersOfOrganization
        ),
        iff(
          context => context.data.shouldAddGroupsToOrganization,
          addGroupsToOrganization,
        ),
        schemaHooks.validateData(organizationPatchValidator),
        schemaHooks.resolveData(organizationPatchResolver)
      ],
      remove: [
        iff(isProvider('external'), isUserOwnerOfOrganization),
        iff(isProvider('external'), isOrganizationReadyToDelete),
        doSoftDeleteInstead,
      ],
    },
    after: {
      all: [
      ],
      get: [iff(isProvider('external'), isUserMemberOfOrganization)],
      create: [
        assignOrganizationIdToUser,
        createDefaultEveryoneGroup,
      ],
      patch: [
        distributeOrganizationSummaries
      ]
    },
    error: {
      all: []
    }
  })
}

const detectOrgRefNameInId = async context => {
  const id = context.id.toString();
  if (id.length < 24) { // a 24 character id is an OID not a refName, so only look at refName if shorter
    let orgList = {};
    if (context.publicDataOnly) {
      orgList = await context.service.find({
        query: {
          publicInfo: "true",
          refName: id,
          $select: organizationPublicFields,
        }
      });
    } else {
      orgList = await context.service.find(
        {query: { refName: id } }
      );
    }
    if (orgList?.total === 1) {
      context.result = orgList.data[0];
    }
  }
  return context;
}

const isOrganizationReadyToDelete = async context => {
  const organization = await context.service.get(context.id);
  //
  // Ensure this organization is not a Personal org
  //
  if (organization.type === OrganizationTypeMap.personal) {
    throw new BadRequest('You cannot delete your personal organization.');
  }
  //
  // Ensure there are no users other than the owner
  //
  if (organization.users.length > 1) {
    throw new BadRequest('To delete, other than the owner, there can be no users in the organization.');
  } else if (organization.users.length === 0) {
    throw new BadRequest('Deletion error. The owner of the organization is missing.'); // this SHOULD NOT happen
  }
  if (organization.users[0]._id.toString() !== organization.owner._id.toString()) {
    throw new BadRequest('Deletion error. The remaining user is not the owner.');
  }
  //
  // Ensure there are no more workspaces
  //
  const wsList = await context.app.service('workspaces').find({
    query: {
      organizationId: organization._id,
    }
  });
  if (wsList.total !== 0) {
    throw new BadRequest(`Deletion error. There are ${wsList.total} remaining workspace(s) in the organization.`);
  }
  //
  return context;
}

const doSoftDeleteInstead = async context => {
  const updatedResult = await context.service.patch(
    context.id,
    {
      deleted: true,
    }
  )
  context.result = updatedResult; // setting this prevents the true DELETE (removal from db) from happening
  const userId = context.result.users[0]._id;
  const user = await context.app.service('users').get(userId);
  let reducedOrgList = user.organizations.filter((org) => org._id.toString() !== context.id.toString());
  await context.app.service('users').patch(
    userId,
    {
      organizations: reducedOrgList
    }
  )
  return context;
}
