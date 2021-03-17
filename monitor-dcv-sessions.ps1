<#
. SYNOPSIS
    Monitors for user activity and interoperates with the AWS cloud
. DESCRIPTION
    This is a script that uses the 'dcv' command to monitor for user activity using the 'on-client-disconnected' and 'on-client-connected' options.
    It expects the AWS Tools for PowerShell to be already installed. If you are using an AWS NICE DCV AMI then this pre-requisite should be already done for you.
. PARAMETER
    no parameters are required
#>

# Maitenance Window does not overlap tasks. If running already, don't try to run again. Validate if true when working with multiple instances.
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

<# Using a while loop 

while ($true) {
    # check every 10 seconds if a new connection is made, for the next 30 minutes
    do {
        $stopWatch = New-Object -TypeName System.Diagnostics.StopWatch;
        $timer = New-TimeSpan -Minutes 1;
        $stopWatch.Start();

        $conn = Invoke-Expression -Command 'C:\Program` Files\NICE\DCV\Server\bin\dcv list-connections -j console |ConvertFrom-Json';
        if (!$conn) {
            Start-Sleep 10;
        } else {
            $stopWatch.Reset();
        }
    } until ($stopWatch.Elapsed -ge $timer)

    # if no connection is made, stop the instance via SNS + Lambda
    if (!$conn) {
        $instance_id = Get-EC2InstanceMetadata -Category InstanceId;
        Publish-SNSMessage -TopicArn 'arn:aws:sns:us-east-1:441224055073:DCV_below_CPU_average' -Message "{""default"":""${instance_id}""}" -MessageStructure 'json' -Subject 'DCV user disconnected';
    }

    # wait a little bit for the Server to stop before the loop restarts
    Start-Sleep -Seconds 180;
}

#>

$stopWatch = New-Object -TypeName System.Diagnostics.StopWatch; $timer = New-TimeSpan -Minutes 30; $stopWatch.Start(); do { $conn = Invoke-Expression -Command 'C:\Program` Files\NICE\DCV\Server\bin\dcv list-connections -j console |ConvertFrom-Json'; if (!$conn) { Start-Sleep 30; } else { $stopWatch.Reset(); } } until ($stopWatch.Elapsed -ge $timer); if (!$conn) { Write-Host "No connections for 30min. Sending message to topic."; $instance_id = Get-EC2InstanceMetadata -Category InstanceId; Publish-SNSMessage -TopicArn 'arn:aws:sns:us-east-1:441224055073:DCV_below_CPU_average' -Message "{""default"":""${instance_id}""}" -MessageStructure 'json' -Subject 'DCV user disconnected'; } }