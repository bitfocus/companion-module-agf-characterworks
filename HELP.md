Characterworks Companion Module
v 1.0.0
Eddie Wettach <ewettach@gmail.com>

Requirements:
1.  Companion
2.  Characterworks 3.7 (it may work on previous versions as well)

How to:
1.  Add an instance of Characterworks to Companion.
2.  Configure the IP address of the server running Characterworks
3.  Configure the port number of the server running Characterworks (default is 5201)
4.  Configure a button with the action Trigger Characterworks
5.  As of version 1.0, there are 3 parameters to fill in (Action, Motion Name, and Channel)
6.  That's it, see example below if you need additional help

Example:
Action: play_motions     *This is the command you want to send to the motion
Motion Name: scorebug    *This is the name of the motion file that you create within Characterworks
Channel: preview         *This is the channel you want to output the graphic on   


Online documentation on Characterworks:
https://www.chrworks.com/help/
Details on what Characterworks will respond to via HTTP POST requests can be found under the heading REMOTE CONTROL within Characterworks Online Help

