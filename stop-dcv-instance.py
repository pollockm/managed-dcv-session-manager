import json
import boto3

ec2 = boto3.client('ec2')
ssm = boto3.client('ssm')

def stopDcvInstance(e):
    try:
        stopResponse = ec2.stop_instances(
            InstanceIds=[
                e
            ]
        )
        print(stopResponse)
    except: 
        print('Could not stop the instance %', e)
        return {
            'statusCode': '200',
            'body': 'Could not stop the instance'
        }

def lambda_handler(event, context):
    print(event)
    
    if ('instanceId' in event):
        # message from SSM is actually a string within a JSON key, need to transform into JSON
        instance_id = json.loads(event['Records'][0]['Sns']['Message'])['instanceId']        
        print(instance_id)
    else:
        # message from the EC2 directly is a simpler one
        instance_id = event['Records'][0]['Sns']['Message']
        print(instance_id)
    
    stopDcvInstance(instance_id)
    
    return {
        'statusCode': '200',
        'body': 'Instance stopped succesfully'
    }
    
