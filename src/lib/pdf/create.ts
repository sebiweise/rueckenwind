import type { TDocumentDefinitions } from 'pdfmake/interfaces';

/**
 * Renders the document in the browser. pdfmake and its embedded Roboto font
 * (with umlauts) are loaded only when needed and come from the app itself.
 */
export async function createPdfBlob(definition: TDocumentDefinitions): Promise<Blob> {
	const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
		import('pdfmake/build/pdfmake'),
		import('pdfmake/build/vfs_fonts')
	]);
	pdfMake.addVirtualFileSystem(vfs);
	return pdfMake.createPdf(definition).getBlob();
}
