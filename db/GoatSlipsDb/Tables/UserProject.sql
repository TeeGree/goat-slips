CREATE TABLE [dbo].[UserProject]
(
	[Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY, 
	[UserId] INT NOT NULL, 
    [ProjectId] INT NOT NULL, 
	CONSTRAINT [FK_UserProject_User] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
    CONSTRAINT [FK_UserProject_Project] FOREIGN KEY ([ProjectId]) REFERENCES [Project]([Id])
)
