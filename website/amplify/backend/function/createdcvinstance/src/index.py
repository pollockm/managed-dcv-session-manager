import json
import boto3
import time

ec2 = boto3.client('ec2')

def listTemplates(params):
  templates = []
  tag = params["tag"] 

  # you can increase the depth of how you query based on a many different factors
  # search the Boto3 EC2 documentation to learn more
  response = ec2.describe_launch_templates(
    Filters=[
      {
        'Name': 'tag-key',
        'Values': [ 
          tag 
        ]
      }
    ]
  )

  for template in response["LaunchTemplates"]:
    item = {
      'name': template["LaunchTemplateName"],
      'id': template["LaunchTemplateId"]
    }
  
    templates.append(item)

  return templates  

def createInstance(params):
  print(params)

  launchTemplateId = params["launchTemplateId"] if params["launchTemplateId"] else None

  # templateId is mandatory other params are optional and override the existing LaunchTemplate variables
  if launchTemplateId is None:
    return { 'statusCode': 200, 'body': 'LaunchTemplate Id not set'}
  else:
    launchTemplateId = params["launchTemplateId"]
    instanceType = params["instanceType"] if params["instanceType"] else None 
    keyName = params["keyName"] if params["keyName"] else None
    instanceCount = 1
    instanceName = params["instanceName"] if params["instanceName"] else None

    print('Params received: {}, {}, {}, {}'.format(launchTemplateId, instanceType, instanceName, keyName))

    if (instanceType is not None) and (keyName is not None) and (instanceName is not None): 
      response = ec2.run_instances(
        InstanceType=instanceType,
        KeyName=keyName,
        TagSpecifications=[
          {
            'ResourceType': 'instance',
            'Tags': [
              {
                'Key': 'Name',
                'Value': instanceName
              }
            ]
          }
        ],
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    elif (instanceType is not None) and (keyName is None) and (instanceName is None): 
      response = ec2.run_instances(
        InstanceType=instanceType,
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    elif (keyName is not None) and (instanceType is None) and (instanceName is None):
      response = ec2.run_instances(
        KeyName=keyName,
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    elif (instanceName is not None) and (instanceType is None) and (instanceName is None):
      response = ec2.run_instances(
        TagSpecifications=[
          {
            'ResourceType': 'instance',
            'Tags': [
              { 
                'Key': 'Name',
                'Value': instanceName
              }
            ]
          }
        ],
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    elif (instanceType is not None) and (keyName is not None) and (instanceName is None):
      response = ec2.run_instances(
        InstanceType=instanceType,
        KeyName=keyName,
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    elif (instanceType is not None) and (instanceName is not None) and (keyName is None):  
      response = ec2.run_instances(
        InstanceType=instanceType,
        TagSpecifications=[
          {
            'ResourceType': 'instance',
            'Tags': [
              { 
                'Key': 'Name',
                'Value': instanceName
              }
            ]
          }
        ],
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    elif (keyName is not None) and (instanceName is not None) and (instanceType is None):
      response = ec2.run_instances(
        KeyName=keyName,
        TagSpecifications=[
          {
            'ResourceType': 'instance',
            'Tags': [
              { 
                'Key': 'Name',
                'Value': instanceName
              }
            ]
          }
        ],
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )        
    else:
      response = ec2.run_instances(
        LaunchTemplate={
          'LaunchTemplateId': launchTemplateId
        },
        MinCount=instanceCount,
        MaxCount=instanceCount
      )
    
  return response

def handler(event, context):
  print('received event:')
  print(event)
  
  arguments = event["arguments"]

  # query must be either 'list' or 'create'
  query = arguments["action"]
  id = arguments["id"] if arguments["id"] is not None else ''
  tag = arguments["tag"] if arguments["tag"] is not None else ''
  instanceType = arguments["instanceType"] if arguments["instanceType"] is not None else ''
  keyName = arguments["keyName"] if arguments["keyName"] is not None else ''
  instanceName = arguments["instanceName"] if arguments["instanceName"] is not None else ''
    
  params = { 
    'tag': tag,
    'launchTemplateId': id,
    'keyName': keyName,
    'instanceType': instanceType,
    'instanceName': instanceName
  }

  print('Query: {}, Params: {}'.format(query, params))
  if query == 'list':
    response = listTemplates(params)
    print('listing LaunchTemplates...')
    print('Templates found: {}'.format(response))
    
    return json.dumps(response)

  elif query == 'create':
    response = createInstance(params) 
    print('creating a new instance... ')

    for info in response["Instances"]:
      details = {
        'SubnetId': info["SubnetId"],
        'InstanceId': info["InstanceId"],
        'ImageId': info["ImageId"],
        'InstanceType': info["InstanceType"],
        'PrivateDns': info["PrivateDnsName"],
        'PrivateIp': info["PrivateIpAddress"],
        'State': info["State"]["Name"],
        'InstanceRole': info["IamInstanceProfile"]["Id"],
        'SecurityGroup': info["SecurityGroups"],
        'Tags': info["Tags"]
      }

      print('Instance details: {}'.format(details))
      return (json.dumps(details))

  else: 
    response = {
      'statusCode': 200,
      'body': 'Could not identify the correct type of query. Either use "list" or "create".'
    }

