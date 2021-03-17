/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDcvInstance = /* GraphQL */ `
  mutation CreateDcvInstance(
    $input: CreateDcvInstanceInput!
    $condition: ModelDcvInstanceConditionInput
  ) {
    createDcvInstance(input: $input, condition: $condition) {
      id
      name
      description
      instanceId
      userMapped
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateDcvInstance = /* GraphQL */ `
  mutation UpdateDcvInstance(
    $input: UpdateDcvInstanceInput!
    $condition: ModelDcvInstanceConditionInput
  ) {
    updateDcvInstance(input: $input, condition: $condition) {
      id
      name
      description
      instanceId
      userMapped
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteDcvInstance = /* GraphQL */ `
  mutation DeleteDcvInstance(
    $input: DeleteDcvInstanceInput!
    $condition: ModelDcvInstanceConditionInput
  ) {
    deleteDcvInstance(input: $input, condition: $condition) {
      id
      name
      description
      instanceId
      userMapped
      createdAt
      updatedAt
      owner
    }
  }
`;
