import json
import boto3

ec2 = boto3.client('ec2')

def handler(event, context):
  print('received event:')
  print(event)

  print(event["arguments"])
  print(event["arguments"]["tag"])

  keyPairs = []
  keys = ec2.describe_key_pairs()

  for key in keys["KeyPairs"]:
    keyPairs.append(
      { 'keyId': key["KeyPairId"], 'keyName': key["KeyName"] }
    )

  response = ec2.describe_instances(
    Filters=[
      {
        'Name': 'tag-key',
        'Values': [
          event["arguments"]["tag"]
        ]
      }
    ]
  )

  instances = []

  for items in response["Reservations"]:
    
    for item in items["Instances"]:  
      print(item["Tags"])

      data = {
        'InstanceId': item["InstanceId"],
        'InstanceType': item["InstanceType"],
        'PrivateIp': item["PrivateDnsName"],
        'PublicIp': item["PublicDnsName"],
        'KeyName': item["KeyName"],
        'State': item["State"]["Name"],
        'Name': item["Tags"]
      }
      
      #print(x, id, imageId, keyName, state)
      #data = { 'InstanceId': id, 'ImageId': imageId, 'KeyName': keyName, 'State': state }
      instances.append(data)
      
  print(instances)

  return (json.dumps(instances),json.dumps(keyPairs))