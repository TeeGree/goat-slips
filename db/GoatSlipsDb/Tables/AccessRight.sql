CREATE TABLE [dbo].[AccessRight]
(
	[Id] INT NOT NULL PRIMARY KEY,
	[Code] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(50) NULL,
	CONSTRAINT [UC_AccessRight] UNIQUE ([Code])
)
