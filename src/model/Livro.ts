import type LivroDTO from "../dto/LivroDTO.js";
import { DatabaseModel } from "./DatabaseModel.js";
 
const database = new DatabaseModel().pool;
 
class Livro {
 
    private id_livro: number = 0;
    private titulo: string;
    private autor: string;
    private editora: string;
    private ano_publicacao: string;
    private isbn: string;
    private quant_total: number;
    private quant_disponivel: number;
    private quant_aquisicao: number; // ✅ Bug corrigido: atributo adicionado (antes era recebido mas nunca armazenado)
    private valor_aquisicao: number;
    private status_livro_emprestado: string = "Disponível";
    private status_livro: boolean = false;
 
    constructor(
        _titulo: string,
        _autor: string,
        _editora: string,
        _ano_publicacao: string,
        _isbn: string,
        _quant_total: number,
        _quant_disponivel: number,
        _quant_aquisicao: number,
        _valor_aquisicao: number
    ) {
        this.titulo = _titulo;
        this.autor = _autor;
        this.editora = _editora;
        this.ano_publicacao = _ano_publicacao;
        this.isbn = _isbn;
        this.quant_total = _quant_total;
        this.quant_disponivel = _quant_disponivel;
        this.quant_aquisicao = _quant_aquisicao; // ✅ Bug corrigido: agora é atribuído
        this.valor_aquisicao = _valor_aquisicao;
    }
 
    // ==================== GETTERS E SETTERS ====================
 
    public getIdLivro(): number { return this.id_livro; }
    public setIdLivro(value: number) { this.id_livro = value; }
 
    public getTitulo(): string { return this.titulo; }
    public setTitulo(value: string) { this.titulo = value; }
 
    public getAutor(): string { return this.autor; }
    public setAutor(value: string) { this.autor = value; }
 
    public getEditora(): string { return this.editora; }
    public setEditora(value: string) { this.editora = value; }
 
    public getAnoPublicacao(): string { return this.ano_publicacao; }
    public setAnoPublicacao(value: string) { this.ano_publicacao = value; }
 
    public getIsbn(): string { return this.isbn; }
    public setIsbn(value: string) { this.isbn = value; }
 
    public getQuantTotal(): number { return this.quant_total; }
    public setQuantTotal(value: number) { this.quant_total = value; }
 
    public getQuantDisponivel(): number { return this.quant_disponivel; }
    public setQuantDisponivel(value: number) { this.quant_disponivel = value; }
 
    public getQuantAquisicao(): number { return this.quant_aquisicao; } // ✅ Getter adicionado
    public setQuantAquisicao(value: number) { this.quant_aquisicao = value; } // ✅ Setter adicionado
 
    public getValorAquisicao(): number { return this.valor_aquisicao; }
    public setValorAquisicao(value: number) { this.valor_aquisicao = value; }
 
    public getStatusLivroEmprestado(): string { return this.status_livro_emprestado; }
    public setStatusLivroEmprestado(value: string) { this.status_livro_emprestado = value; }
 
    public getStatusLivro(): boolean { return this.status_livro; }
    public setStatusLivro(value: boolean) { this.status_livro = value; }
 
    // ==================== MÉTODOS PRIVADOS ====================
 
    /**
     * Monta um objeto LivroDTO a partir de uma linha retornada pelo banco de dados.
     */
    private static montarDTO(linha: any): LivroDTO {
        return {
            id_livro: linha.id_livro,
            titulo: linha.titulo,
            autor: linha.autor,
            editora: linha.editora,
            ano_publicacao: linha.ano_publicacao,
            isbn: linha.isbn,
            quant_total: linha.quant_total,
            quant_disponivel: linha.quant_disponivel,
            quant_aquisicao: linha.quant_aquisicao,
            valor_aquisicao: linha.valor_aquisicao,
            status_livro_emprestado: linha.status_livro_emprestado,
            status_livro: linha.status_livro
        };
    }
 
    /**
     * Monta o array de valores para INSERT e UPDATE, aplicando padronização em maiúsculas.
     */
    private static montarValores(livro: Livro): any[] {
        return [
            livro.getTitulo().toUpperCase(),
            livro.getAutor().toUpperCase(),
            livro.getEditora().toUpperCase(),
            livro.getAnoPublicacao().toUpperCase(),
            livro.getIsbn().toUpperCase(),
            livro.getQuantTotal(),
            livro.getQuantDisponivel(),
            livro.getQuantAquisicao(), // ✅ Bug corrigido: quant_aquisicao agora é incluído
            livro.getValorAquisicao(),
            livro.getStatusLivroEmprestado().toUpperCase()
        ];
    }
 
    // ==================== MÉTODOS ESTÁTICOS ====================
 
    /**
     * Retorna todos os livros ativos cadastrados no banco de dados.
     */
    static async listarLivros(): Promise<Array<LivroDTO> | null> {
        try {
            const respostaBD = await database.query(`SELECT * FROM Livro WHERE status_livro = TRUE;`);
 
            // ✅ Bug corrigido: retorna null em vez de lista vazia quando não há resultados
            if (respostaBD.rows.length === 0) return null;
 
            return respostaBD.rows.map(Livro.montarDTO);
 
        } catch (error) {
            console.error(`Erro ao listar livros: ${error}`);
            return null;
        }
    }
 
    /**
     * Retorna um livro específico pelo seu ID.
     *
     * @param id_livro Identificador único do livro
     */
    static async listarLivro(id_livro: number): Promise<LivroDTO | null> {
        try {
            const respostaBD = await database.query(
                `SELECT * FROM Livro WHERE id_livro = $1`,
                [id_livro]
            );
 
            // ✅ Bug corrigido: verifica se rows[0] existe antes de acessá-lo
            if (respostaBD.rows.length === 0) return null;
 
            return Livro.montarDTO(respostaBD.rows[0]);
 
        } catch (error) {
            console.error(`Erro ao buscar livro: ${error}`);
            return null;
        }
    }
 
    /**
     * Cadastra um novo livro no banco de dados.
     *
     * @param livro Objeto Livro com os dados a serem inseridos
     */
    static async cadastrarLivro(livro: Livro): Promise<boolean> {
        try {
            const query = `
                INSERT INTO Livro (titulo, autor, editora, ano_publicacao, isbn, quant_total, quant_disponivel, quant_aquisicao, valor_aquisicao, status_livro_emprestado)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id_livro;
            `;
 
            const result = await database.query(query, Livro.montarValores(livro));
 
            if (result.rows.length > 0) {
                console.log(`Livro cadastrado com sucesso. ID: ${result.rows[0].id_livro}`);
                return true;
            }
 
            return false;
 
        } catch (error) {
            console.error(`Erro ao cadastrar livro: ${error}`);
            return false;
        }
    }
 
    /**
     * Atualiza os dados de um livro ativo no banco de dados.
     *
     * @param livro Objeto Livro com os dados atualizados
     */
    static async atualizarLivro(livro: Livro): Promise<boolean> {
        try {
            // ✅ Bug corrigido: usa getter em vez de acesso direto ao atributo privado
            const livroConsulta = await Livro.listarLivro(livro.getIdLivro());
 
            if (!livroConsulta || !livroConsulta.status_livro) return false;
 
            const query = `
                UPDATE Livro SET
                    titulo = $1,
                    autor = $2,
                    editora = $3,
                    ano_publicacao = $4,
                    isbn = $5,
                    quant_total = $6,
                    quant_disponivel = $7,
                    quant_aquisicao = $8,
                    valor_aquisicao = $9,
                    status_livro_emprestado = $10
                WHERE id_livro = $11;
            `;
 
            const valores = [...Livro.montarValores(livro), livro.getIdLivro()];
            const respostaBD = await database.query(query, valores);
 
            return respostaBD.rowCount != 0;
 
        } catch (error) {
            console.error(`Erro ao atualizar livro: ${error}`);
            return false;
        }
    }
 
    /**
     * Realiza a remoção lógica de um livro e seus empréstimos vinculados.
     *
     * @param id_livro Identificador único do livro a ser removido
     */
    static async removerLivro(id_livro: number): Promise<boolean> {
        try {
            const livro = await Livro.listarLivro(id_livro);
 
            if (!livro || !livro.status_livro) return false;
 
            await database.query(
                `UPDATE Emprestimo SET status_emprestimo_registro = FALSE WHERE id_livro = $1`,
                [id_livro]
            );
 
            const result = await database.query(
                `UPDATE Livro SET status_livro = FALSE WHERE id_livro = $1`,
                [id_livro]
            );
 
            return result.rowCount != 0;
 
        } catch (error) {
            console.error(`Erro ao remover livro: ${error}`);
            return false;
        }
    }
}
 
export default Livro;