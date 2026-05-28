$outFile = 'f:\ai\alliancedev\backend\conn-result.txt'
$results = @()

$tcp1 = New-Object System.Net.Sockets.TcpClient
try {
    $tcp1.Connect('106.14.240.103', 3306)
    $results += 'MySQL 3306: CONNECTED'
} catch {
    $results += "MySQL 3306: FAILED - $($_.Exception.Message)"
}
$tcp1.Dispose()

$tcp2 = New-Object System.Net.Sockets.TcpClient
try {
    $tcp2.Connect('106.14.240.103', 6379)
    $results += 'Redis 6379: CONNECTED'
} catch {
    $results += "Redis 6379: FAILED - $($_.Exception.Message)"
}
$tcp2.Dispose()

$results | Out-File -FilePath $outFile -Encoding utf8
