﻿CREATE TABLE [dbo].[User]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [Username] VARCHAR(50) NOT NULL,
	[Password] VARCHAR(111) NOT NULL
)
