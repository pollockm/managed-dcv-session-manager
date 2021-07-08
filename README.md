# Demo - Managed DCV solution
&nbsp;

> DISCLAIMER:
> 
> The instructions laid out here are OUTDATED. I am on the verge of integrating MFA into this solution and will update the instructions. In order to install the portal, you have to clone
> the Amplify project. The cloudformation template does not deploy the Amplify project (yet), but it already incorporates the latests DCV builds (December 2020).
&nbsp;

This demo delivers a portal that will allow users to log in using Amazon Cognito and manage their NICE DCV instances on AWS. It uses automation through AWS Systems Manager in order to scan for idling connections and stop the servers. It also allows customers to list all DCV instances running, stopped, and terminated. And it allows users to start their DCV Sessions right from the portal. 

This is by far a complete thorough solution. This demos allows customer to grasp how easy it is to managed Windows-based DCV instances when not using solutions such as Amazon AppStream or AWS ParallelCluster. It supports Linux-based DCV instances as well, as those not running with GPU. But for Linux-based instances I would suggest customers investigate this workshop [here](https://dcv-batch.workshop.aws/) which explains how to use AWS Batch to spin up Linux-based DCV instances on containers, using Spot instances, and managing the lifecycle of the instances automatically. 

This solution was created based on a customer feedback, and it integrates many of this specific customer's needs. I am more than happy to hear from other customers, and fellow colleagues, to learn how to improve the solution. Also, feel free to clone it/fork it and develop you own. 
&nbsp;

> DISCLAIMER: 
> 
> This solution has been developed as a POC for a customer, it is not intended to run in production, nor it is an official AWS solution. All the services used here will have AWS support as > standalones services. 

&nbsp;

In the next sections I will go through the steps required to run this demo, and explain a bit of how it is setup. Before you run this demo, either make sure you have setup the solution following the steps below or that you have deployed in by using the AWS CloudFormation stack provided . 

&nbsp;
## Step 1: Show the services used and how they are configured
***

### EC2 & Resource Groups


 1. Go to EC2 dashboard, start up some DCV instances
   1. You can do that by Launching an instance with a NICE DCV AMI from the AWS Marketplace
 2. Add a tag with Key = DCV and Value = Yes. This will be the tag you use in the Resource Group.
 3. Show the instance have the Tag DCV:Yes. This is defined in a Resource Group. 
 4. Go to the Resource Group dashboard and show how to create a Resource Group.
   1. Make sure you create a Resource Group that by group AWS::EC2::Instances and look for Tag:DCV=Yes
 5. Go back to the EC2 dashboard and launch a new EC2 using the LaunchTemplate
&nbsp;

### Launch Templates


  1. Go to the Amazon EC2 console, and click on Launch Templates
  2. Create a Launch Template and make sure you include the following: 
    1. The AMI you have created from the DCV Server instance you have started in the previous section
    2. 
&nbsp;

### AWS SSM Maintenance Window & AWS SSM Document


 1. Go to the AWS SSM console
 2. Go to Document (bottom of menu)
 3. Create a new Document and copy/paste the code below


```
 ---
schemaVersion: "2.2"
description: "Command Document Example JSON Template"
parameters:
  commands:
    type: "String"
    description: "List DCV Sessions that are connected"
    default: 
      $stopWatch = New-Object -TypeName System.Diagnostics.StopWatch;
      $timer = New-TimeSpan -Minutes 30;
      $stopWatch.Start();
      
      $conn = Invoke-Expression -Command 'C:\Program` Files\NICE\DCV\Server\bin\dcv list-connections -j console |ConvertFrom-Json';
      if ($conn) {
          Write-Host "There are active connections. Exiting.";
          exit
      } else {
          Start-Sleep -Seconds 60;
          while ($stopWatch.Elapsed -le $timer) {
              $conn = Invoke-Expression -Command 'C:\Program` Files\NICE\DCV\Server\bin\dcv list-connections -j console |ConvertFrom-Json';
              if (!$conn) {
                  Start-Sleep -Seconds 60;
              } else {
                  Write-Host "There are active connections. Exiting."
                  exit
              }
          }
          if (!$conn) {
              Write-Host "No connections for 30min. Sending message to topic.";
              $instance_id = Get-EC2InstanceMetadata -Category InstanceId;
              Publish-SNSMessage -TopicArn 'arn:aws:sns:us-east-1:441224055073:DCV_below_CPU_average' -Message "{""default"":""${instance_id}""}" -MessageStructure 'json' -Subject 'DCV user disconnected';
          } else { 
              Write-Host "Some error occurred and the message was not posted."
              exit
          }
      }
      
mainSteps:
- action: "aws:runPowerShellScript"
  name: runPowerShellScript
  inputs:
    timeoutSeconds: 2100
    runCommand:
    - "{{ commands }}" 
```


 4. Now go to the Maintenance Window (on the left hand menu) and create a Maintenance Window
 5. Add the Command Document you just created to the Maintenance Window, under Tasks
 6. Choose as Targets the Resource Group you just created
&nbsp;

## Step 2: Run the API to create an instance 
***

  1. Open Postman
  2. Run the API RunInstances
  3. Run the API DescribeInstances
  4. Make sure your Security Groups have the port 8443 opened for your IP address
&nbsp;

## Step 3: Access the instance using the native DCV client and web browser
***

  1. If you have the native DCV client installed in your machine, use it to connect to the instance
    1. The IP address is the one you got by running the DescribeInstance API
  2. Navigate a bit, talk about DCV features
    1. Show how to transfer files from your machine to the client
    2. Show how you can copy/paste (native client)
    3. Show how to see latency and change the responsiveness/quality of the session
    4. Open a second window and show multiple displays
    5. Discuss any other feature that your customer might be instered in
  3. After you do everything using the native DCV client, let it open and use the browser to connect a second client to the same session. Show the customer how you can allow users to collaborate by sharing a single session without disconnecting them.
  4. Make sure you also demonstrate how you can use a browser to use DCV, without requiring a native client installed
    1. Discuss the limitations, such as the copy/paste differences
&nbsp;

## Step 4: Show how Maintenance Windows works
***

  1. After you disconnect (make sure you disconnected) go back to the AWS console
  2. Go to SSM and click on Maintenance Window
  3. Look at the Maintenance Windows executions and that the script detect that there was an active session and did not turn off the intsance
  4. While you wait a bit for the Maintenance Window to run again and turn off the instance (now that you are not connected anymore), go to the Amazon SNS console and show the topic you have created
  5. Then click on the lambda function that is subscribed to the topic
  6. Show the code and explains that for the sake of this PoC it is a simple code that calls StopInstance, but that is flexible enough and simple to customize the way the customer requires
  7. Finally, discuss how DCV can also be configured on the DCV Server itself, for example, setting idle timeouts that will automatically disconnect users, alarm windows that will alert an user when it is getting close to the session timeout (so they might interact with the session and avoid being disconnected), and any other DCV feature your customer might require.
  8. After the specified amount of time (usually 10 minutes), the Maintenance Window will execute again and will detect that there are no running sessions and stop the instance
  9. Go back to the Amazon EC2 panel and show that the server has been shutdown
&nbsp;


