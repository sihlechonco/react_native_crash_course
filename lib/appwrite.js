import { Client, Account, ID, Avatars, Databases,Query, Storage } from 'react-native-appwrite';

export const config ={
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId:'66c23075002a8ec8ddcb',
    databaseId:'66c2323a0018a3bdd928',
    userCollectionId:'66c2325d00367d33f482',
    videoCollectionId:'66c2329c003186ceabef',
    storageId:'66c234d6000f9a3d0ac0'

}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId,
} = config;


// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const avatar = new Avatars(client);
const database = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email,password,username) =>{
    // Register User
    try{
        const newAccount = await account.create
        (
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatar.getInitials(username)

       const newUser = await database.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: ID.unique(),
                email,
                username,
                avatar: avatarUrl
            }
        )

        await signIn(email,password)

        return newUser;
    }
    catch(error)
    {
        console.log(error);
        throw new Error(error);
    }
}

export const signIn = async (email,password) =>
{
    try{
        const session = await account.createEmailPasswordSession(email,password)

        return session;
    }
    catch(error)
    {
        console.log(error);
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await database.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )

        if(!currentUser) throw Error;
        
        return currentUser.documents[0];

    } catch (error) {
        console.log(error)
    }
}

export const getAllPosts = async () => {
    try {
        const posts = await database.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt')]
        )

        return posts.documents;

    } catch (error) {
        throw new Error(error);
    }
}

export const getLastestPosts = async () => {
    try {
        const posts = await database.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(3)]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const searchPosts = async (query) => {
    try {
        const posts = await database.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.contains('title', query)]
        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getUserPosts = async (userId) => {
    try {
        const posts = await database.listDocuments(
            databaseId,
            videoCollectionId,

        )

        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const signOut = async () => {
    try{
        const session = await account.deleteSession('current');
        return session;
    }
    catch(error)
    {
        throw new Error(error);
    }
}

export const getFilePreview = async (fileId, type) =>{
    let fileUrl;

    try {
        if(type === 'video'){
            fileUrl = storage.getFileView(storageId,fileId)
        } else if(type === 'image'){
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
        }
        else{
            throw new Error('Invalid file type')
        }
        if(!fileUrl) throw Error;

        return fileUrl;
        
    } catch (error) {
        throw new Error(error);           
    }
}

export const uploadFile = async (file, type) =>{
    if(!file) return;

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest};

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            asset
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type);

        return fileUrl;

    } catch (error) {
        throw new Error(error);        
    }
}

export const createVideo = async(form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video'),
        ])

        const newPost = await database.createDocument(
            databaseId,videoCollectionId,ID.unique(),{
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator:form.userId
            }
        )

        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}