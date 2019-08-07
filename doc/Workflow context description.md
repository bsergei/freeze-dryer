## Workflow Context 

Expression|Type|Example|Description
---|---|---|---
time.total_hours|Property|"time.total_hours > 1"|Time in hours since recipe entry started.
time.total_minutes|Property|"time.total_minutes > 1"|Time in minutes since recipe entry started.
time.total_seconds|Property|"time.total_seconds > 1"|Time in seconds since recipe entry started.
time.delay|Function|"time.delay(1000)"|Delays recipe entry execution by specified number of milliseconds
units.compressor|Property|"units.compressor = true"|Read/write compressor's state
units.vacuum|Property|"units.vacuum = true"|Read/write vacuum's state
units.heater|Property|"units.heater = true"|Read/write heater's state
units.drain_valve|Property|"units.drain_valve = true"|Read/write drain_valve's state
units.fan|Property|"units.fan = true"|Read/write fan's state
temp.{sensor_id}|Property|"temp.heater1 > 30"|Read specified temperature sensor
vacuum.A0|Property|"vacuum.A0 < 200"|Read specified vacuum sensor value in mTor
vacuum.A1|Property|"vacuum.A1 < 200"|Read specified vacuum sensor value in mTor
log(msg)|Function|"log('This will be logged')"|Print out message in log file

