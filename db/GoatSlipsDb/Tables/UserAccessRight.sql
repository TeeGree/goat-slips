CREATE TABLE [dbo].[UserAccessRight]
(
	[Id] INT NOT NULL PRIMARY KEY,
	[UserId] INT NOT NULL, 
    [AccessRightId] INT NOT NULL,
	CONSTRAINT [FK_UserAccessRight_User] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
    CONSTRAINT [FK_UserAccessRight_AccessRight] FOREIGN KEY ([AccessRightId]) REFERENCES [AccessRight]([Id]),
	CONSTRAINT [UC_UserAccessRight] UNIQUE ([UserId], [AccessRightId])
)
