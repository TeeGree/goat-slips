﻿CREATE TABLE [dbo].[Project]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
    [Name] VARCHAR(100) NOT NULL,
	[Rate] DECIMAL(18,2) NOT NULL DEFAULT(0)
)
