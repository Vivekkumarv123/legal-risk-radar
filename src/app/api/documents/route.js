import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { verifyToken } from "@/middleware/auth.middleware";
import { nanoid } from "nanoid";

// GET: Retrieve a user's documents, or a single document if id is provided
export async function GET(req) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authResult.user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const docRef = db.collection("documents").doc(id);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      const docData = docSnap.data();
      if (docData.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized access to document" }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        document: { id: docSnap.id, ...docData }
      });
    }

    // List all documents of the user
    const snapshot = await db.collection("documents")
      .where("userId", "==", userId)
      .get();

    const documents = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        title: data.title,
        templateType: data.templateType,
        themeColor: data.themeColor || "gold",
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      });
    });

    // Sort descending by updatedAt
    documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("GET documents API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Save or update a document
export async function POST(req) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authResult.user.id;

    const body = await req.json();
    const { id, title, templateType, content, variablesValues, themeColor, signatureMethod, signatureBase64, stampMethod, stampBase64, stampColor, footerText } = body;

    const now = new Date();
    let docId = id;

    if (docId) {
      // Update existing document
      const docRef = db.collection("documents").doc(docId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const existingData = docSnap.data();
        if (existingData.userId !== userId) {
          return NextResponse.json({ error: "Unauthorized access to document" }, { status: 403 });
        }

        const updateData = {
          updatedAt: now
        };

        if (title !== undefined) updateData.title = title;
        if (templateType !== undefined) updateData.templateType = templateType;
        if (content !== undefined) updateData.content = content;
        if (variablesValues !== undefined) updateData.variablesValues = variablesValues;
        if (themeColor !== undefined) updateData.themeColor = themeColor;
        if (signatureMethod !== undefined) updateData.signatureMethod = signatureMethod;
        if (signatureBase64 !== undefined) updateData.signatureBase64 = signatureBase64;
        if (stampMethod !== undefined) updateData.stampMethod = stampMethod;
        if (stampBase64 !== undefined) updateData.stampBase64 = stampBase64;
        if (stampColor !== undefined) updateData.stampColor = stampColor;
        if (footerText !== undefined) updateData.footerText = footerText;

        await docRef.update(updateData);
        return NextResponse.json({ success: true, message: "Document updated", id: docId });
      }
    }

    // Create new document
    if (!docId) {
      docId = nanoid(12);
    }

    const newDocData = {
      userId,
      title: title || "Untitled Document",
      templateType: templateType || "CUSTOM",
      content: content || null,
      variablesValues: variablesValues || {},
      themeColor: themeColor || "gold",
      signatureMethod: signatureMethod || "draw",
      signatureBase64: signatureBase64 || "",
      stampMethod: stampMethod || "none",
      stampBase64: stampBase64 || "",
      stampColor: stampColor || "blue",
      footerText: footerText || "",
      createdAt: now,
      updatedAt: now
    };

    await db.collection("documents").doc(docId).set(newDocData);

    return NextResponse.json({
      success: true,
      message: "Document created",
      id: docId,
      document: { id: docId, ...newDocData }
    });
  } catch (error) {
    console.error("POST documents API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a document
export async function DELETE(req) {
  try {
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authResult.user.id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    const docRef = db.collection("documents").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const docData = docSnap.data();
    if (docData.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to document" }, { status: 403 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("DELETE documents API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
