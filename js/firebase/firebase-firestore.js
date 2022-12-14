import { getFirestore, collection, getDocs, getDoc, updateDoc, doc, addDoc, query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

async function getDocWhere(collection, field, operation, value) {
    const q = query(collection, where(field, operation, value));
    const res = await getDocs(q);
    if (res.docs.length == 0) {
        return null;
    } else {
        return res.docs[0].data();
    }
}

async function getSingleDoc(db, collname, docname) {
    const d = doc(db, collname, docname);
    const res = await getDoc(d);
    return res.data();
}

export const Call = {
    getDocWhere,
    getSingleDoc,
}

export const FirebaseFirestore = {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    updateDoc,
    doc,
    addDoc,
    query,
    where,
};