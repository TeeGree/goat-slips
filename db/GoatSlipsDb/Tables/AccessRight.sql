CREATE TABLE [dbo].[AccessRight]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Code] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(200) NULL,
	CONSTRAINT [UC_AccessRight] UNIQUE ([Code])
)
