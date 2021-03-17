/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listDcv = /* GraphQL */ `
  query ListDcv($tag: String!) {
    listDcv(tag: $tag)
  }
`;
export const createDcv = /* GraphQL */ `
  query CreateDcv(
    $tag: String
    $id: String
    $keyName: String
    $instanceType: String
    $instanceName: String
    $action: Action!
  ) {
    createDcv(
      tag: $tag
      id: $id
      keyName: $keyName
      instanceType: $instanceType
      instanceName: $instanceName
      action: $action
    )
  }
`;
export const brokerActions = /* GraphQL */ `
  query BrokerActions(
    $action: Action!
    $sessionId: String
    $owner: String
    $sessionType: String
    $concurrency: Int
    $glenabled: Glenabled
    $tags: [String]
  ) {
    brokerActions(
      action: $action
      sessionId: $sessionId
      owner: $owner
      sessionType: $sessionType
      concurrency: $concurrency
      glenabled: $glenabled
      tags: $tags
    )
  }
`;
