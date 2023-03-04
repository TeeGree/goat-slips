CREATE TABLE [dbo].[Query]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Name] VARCHAR(50) NOT NULL,
	[OwnerUserId] INT NOT NULL, 
	[FromDate] DATE NULL, 
	[ToDate] DATE NULL, 
	[Description] VARCHAR(200) NULL,
	CONSTRAINT [FK_Query_OwnerUser] FOREIGN KEY ([OwnerUserId]) REFERENCES [User]([Id]),
	CONSTRAINT [UC_Query_Name] UNIQUE ([OwnerUserId], [Name])
)
