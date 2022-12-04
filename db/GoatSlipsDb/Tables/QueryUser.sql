CREATE TABLE [dbo].[QueryUser]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[QueryId] INT NOT NULL, 
	[UserId] INT NOT NULL, 
	CONSTRAINT [FK_QueryUser_Query] FOREIGN KEY ([QueryId]) REFERENCES [Query]([Id]),
	CONSTRAINT [FK_QueryUser_User] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
)
